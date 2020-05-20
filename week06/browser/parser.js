const EOF = Symbol('EOF')  // End of file


let currentToken = null;
let currentAttribute = null;
// 发生parse-error时 添加的信息
let commentToken = null;

let currentTextNode = null

let stack = [{type: "document", children: []}]


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
      stack.pop()
    }
    currentTextNode = null
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
    commentToken = {
      type: 'questionMark',
      data: ''
    }
    return BogusComment(c)
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
    currentToken.isSelfClosing = true
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



// 标记声明状态
function markupDeclaration(c) {

}
module.exports.parserHTML = function parserHTML(html) {
  let state = data;
  for(let c of html) {
    console.log(c)
    state = state(c)
  }
  state = state(EOF)
  console.log(stack[0]);
  
}