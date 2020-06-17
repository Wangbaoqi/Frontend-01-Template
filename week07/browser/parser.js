const css = require('css')
const layout  = require('./layout')


const EOF = Symbol('EOF')  // End of file


let currentToken = null;
let currentAttribute = null;
// 发生parse-error时 添加的信息
let commentToken = null;

let currentTextNode = null

let stack = [{type: "document", children: []}]
let rules = []

function addCssRules(text) {
  let ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}

function match(el, selector) {
  if(!el || !selector) return false;

  if(selector.charAt(0) == "#") {
    let attr = el.attributes.filter(e => e.name == "id")[0]
    if(attr && attr.value === selector.replace('#', '')) {
      return true
    }
  }else if(selector.charAt(0) == ".") {
    let attr = el.attributes.filter(e => e.name == "class")[0]
    if(attr && attr.value === selector.replace('.', '')) {
      return true
    }
  }else {
    if(el.tagName === selector) {
      return true
    }
  }
  return false
}

function specificity(selector) {
  let p = [0,0,0,0]
  let selectorParts = selector.split(' ');
  for(let part of selectorParts) {
    if(part.charAt(0) == "#") {
      p[1] += 1
    }else if(part.charAt(0) == ".") {
      p[2] += 1
    }else {
      p[3] += 1
    }
  }
  return p
}

function compare(sp1, sp2) {
  if(sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0]
  }
  if(sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  }
  if(sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  }
  return sp1[3] - sp2[3]
}

function computeCSS(el) {
  // console.log(rules);
  // console.log('compute css for el', el);

  let els = stack.slice().reverse()

  if(!el.computedStyle) {
    el.computedStyle = []
  }

  for(let rule of rules) {
    let selctorParts = rule.selectors[0].split(" ").reverse()

    if(!match(el, selctorParts[0])) continue;

    let matched = false

    let j = 1

    for(let i = 0; i < els.length; i++) {
      if(match(els[i], selctorParts[j])){
        j++
      }
    }

    if(j >= selctorParts.length) {
      matched = true
    }
    if(matched) {
      let sp = specificity(rule.selectors[0])
      // console.log("el", el, ' rule', rule);
      let computedStyle = el.computedStyle;
      for(let dec of rule.declarations) {
        if(!computedStyle[dec.property]) {
          computedStyle[dec.property] = {}
        }
        if(!computedStyle[dec.property].specificity) {
          computedStyle[dec.property].value = dec.value
          computedStyle[dec.property].specificity = sp
        }else if(compare(computedStyle[dec.property].specificity, sp) < 0) {
          computedStyle[dec.property].value = dec.value
          computedStyle[dec.property].specificity = sp
        }
      }
      // console.log(el.computedStyle);
      
    }
  }
  
}

function emit(token) {
  // if(token.type != 'text') {
  //   console.log(token)
    
  // }
  let top = stack[stack.length - 1]

  if(token.type == "startTag") {
    let el = {
      type: 'element',
      children: [],
      attributes: []
    }
    el.tagName = token.tagName

    for(let p in token) {
      if(p != "type" && p != "tagName") {
        el.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    computeCSS(el)

    top.children.push(el)
    el.parent = top

    if(!token.isSelfClosing) {
      stack.push(el)
    }
    currentTextNode = null
  }else if(token.type == 'endTag') {
    if(top.tagName != token.tagName) {
      throw new Error("tag start end does't match")
    }else {
      if(top.tagName === 'style') {
        addCssRules(top.children[0].content)
      }
      // layout
      layout(top)

      stack.pop()
    }
    currentTextNode = null
  }else if(token.type == "text") {
    if(currentTextNode == null) {
      currentTextNode = {
        type: "text",
        content: ""
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}


// 入口状态机
function data(c) {
  if(c == '<') {
    return tagOpen
  }else if(c == EOF) {
    return emit({
      type: "EOF"
    })
  }else {
    emit({
      type: "text",
      content: c
    })
    return data
  }
}

// 开始标签 
// 自闭合标签 <span/>
// 自闭合标签 <span></span>

function tagOpen(c) {
  if(c == '!') {
    return markupDeclaration
  }else if(c == '/') {
    return endTagOpen
  }else if(c.match(/^[a-xA-Z]$/)){
    currentToken = {
      type: "startTag",
      tagName: ""
    }
    return tagName(c)
  }else if(c == "?"){
    commentToken = {
      type: 'questionMark',
      data: ''
    }
    return BogusComment(c)
  }else if(c == "EOF"){
    emit({
      type: "EOF"
    })
  }else {
    emit({
      type: "text", // or type: < 
      content: c
    })
    return ;
  }
}


// 结束标签 
function endTagOpen(c) {
  if(c.match(/^[a-xA-Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: ""
    }
    return tagName(c)
  }else if(c == ">") {
    // return data(c)
  }else if(c == "EOF") {
    return emit({
      type: "EOF" // type < or /
    })
  }else {
    // commentToken = {
    //   type: 'questionMark',
    //   data: ''
    // }
    // return BogusComment(c)
  }
}
// 标签名称
function tagName(c) {
  // U+0009 CHARACTER TABULATION (tab)
  // U+000A LINE FEED (LF)
  // U+000C FORM FEED (FF)
  // U+0020 SPACE
  if(c.match(/^[\t\n\f ]$/)) {
    return beforeAtributeName;
  }else if(c == "/") {
    return selfClosingStartTag;
  }else if(c == ">") {
    emit(currentToken)
    return data
  }else if(c.match(/^[a-xA-Z]$/)) {
    currentToken.tagName += c;
    return tagName
  }else if(c == "EOF") {
    emit({
      type: "EOF"
    })
    return data
  }else {
    currentToken.tagName += c;
    return tagName
  }
}

function beforeAtributeName(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    return beforeAtributeName
  }else if(c == "=") {

  }else if(c == ">" || c == "/" || c == EOF) {
    // 当前标签 新增一个属性
    return afterAttributeName(c)

  }else {
    currentAttribute = {
      name: "",
      value: ""
    }
    return attributeName(c)
  }
}

function selfClosingStartTag(c) {
  if(c == ">") {
    currentToken.isSelfClosing = true;
    emit(currentToken)
    return data
  }else if(c == "EOF") {

  }else {

  }
}

/******** first step *******/


// 标签属性 
function attributeName(c) {
  if(c.match(/^[\t\n\f ]$/) || c == "/" || c == EOF || c == ">") {
    return afterAttributeName(c)
  }else if(c == "=") {
    return beforeAtributeValue
  }else if(c == '\u0000') {
    currentAttribute.name += '\ufffd'
  }else if(c == "\"" || c == "'" || c == "<") {
    //  Treat it as per the "anything else" entry below.
    currentAttribute.name += c
    return attributeName
  }else {
    currentAttribute.name += c
    return attributeName
  }
}

// 标签属性名之后属性
function afterAttributeName(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  }else if(c == "/") {
    return selfClosingStartTag;
  }else if(c == "=") {
    return beforeAtributeValue
  }else if(c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken)
    return data
  }else if(c == EOF) {
    emit({
      type: "EOF"
    })
  }else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: "",
      value: ""
    }
    return attributeName(c)
  }
}

function beforeAtributeValue(c) {
  if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
    return beforeAtributeValue
  }else if(c == "\"") {
    return doubleQuotedAttributeValue;
  }else if(c == "\'") {
    return singleQuotedAttributeValue
  }else if(c == ">") {
    // TODO
    emit(currentToken)
    return data
  }else {
    return UnquotedAttibutedValue(c)
  }
}

function doubleQuotedAttributeValue(c) {
  if(c == "\"") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  }else if(c == "&") {
    // TODO
  }else if(c == "\u0000") {
    // TODO
  }else if(c == EOF) {
    emit({
      type: EOF
    })
  }else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue(c) {
  if(c == "\'") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  }else if(c == "&") {
    // TODO
  }else if(c == "\u0000") {
    // TODO
  }else if(c == EOF) {
    // emit({
    //   type: EOF
    // })
  }else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

function afterQuotedAttributeValue(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    return beforeAtributeName
  }else if(c == "/") {
    return selfClosingStartTag
  }else if(c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken)
    return data
  }else if(c == EOF) {
    emit({
      type: EOF
    })
  }else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue
  }
}

function UnquotedAttibutedValue(c) {
  if(c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAtributeName
  }else if(c == "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag
  }else if(c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken)
    return data
  }else if(c == "\u0000") {

  }else if(c == "\'" || c == "\"" || c == "<" || c == "=" || c == "`") {

  }else if(c == EOF) {

  }else {
    currentAttribute.value += c;
    return UnquotedAttibutedValue
  }
}










/*********************error start ************************/
// 标记声明状态
function markupDeclaration(c) {

}

/*********************error end ************************/
module.exports.parserHTML = function parserHTML(html) {

  let state = data;
  for(let c of html) {
    state = state(c)
  }
  state = state(EOF);

  return stack[0];
}