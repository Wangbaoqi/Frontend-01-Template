function convertStringToNumber(string, hex = 10) {

  const number_reg = /(\.\d+|(0|[0-9])\d*\.?\d*)([eE][-\+]?\d+)|(0[bB]?[01]+)|(0[oO]?[0-7]+)|(0[xX]?[0-9a-fA-F]+)/

  if(typeof string !== 'string') {
    throw 'param must is string type'
  }

  if(!number_reg.test(string)) {
    throw 'number is illegal'
  }
  // 整数
  let isInterger = /(\.\d+|(0|[0-9])\d*\.?\d*)([eE][-\+]?\d+)/.test(string);
  // 二进制
  let isBinary = /0[bB]?[01]+/.test(string);
  // 八进制
  let isOctal = /0[oO]?[0-7]+/.test(string);
  // 十六进制
  let isHex = /0[xX]?[0-9a-fA-F]+/.test(string);


  if(isInterger) hex = 10;
  if(isBinary) hex = 2;
  if(isOctal) hex = 8;
  if(isHex) hex = 16;

  if(isBinary || isOctal || isHex) {
    // 去掉 0b || 0o || ox
    string = string.slice(2);
  }

  let i = 0;
  let number = 0;

  if(!isHex) {
    // expoent
    let isExponent = /[eE][-\+]?/.test(string);
    if(!isExponent) { 
      let char = string.split('');


      while (i < char.length && char[i] != '.') {
        number *= hex;
        number += char[i].codePointAt(0) - '0'.codePointAt(0);
        i++
      }

      if (char[i] == '.') {
        i++
      }
      let fraction = 1;
      while (i < char.length) {
        fraction /=  hex;
        number += (char[i].codePointAt(0) - '0'.codePointAt(0)) * fraction;
        i++;
      }
      return number;
    }else {
      // TODO 
      
    }
    
  }else {
    // convert 2F like this
    let char = string.toUpperCase().split(''); 
    let hexEunm = ['A', 'B', 'C', 'D', 'E', 'F'];

    while(i < char.length) {
      number *= hex;
      if(hexEunm.includes(char[i])) {
        number += char[i].codePointAt(0) - '0'.codePointAt(0) - 7;
      }else {
        number += char[i].codePointAt(0) - '0'.codePointAt(0);
      }
      i++;
    }
    return number;
  }
}
