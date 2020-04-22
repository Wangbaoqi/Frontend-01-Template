


// 整数
var regInterg = /(\.\d+|(0|[0-9])\d*\.?\d*)([eE][-\+]?\d+)/
// 二进制
var regBinary = /0[bB]?[01]+/
// 八进制
var regOctal = /0[oO]?[0-7]+/
// 十六进制
var regHex = /0[xX]?[0-9a-fA-F]+/

// Number Literals
var number_reg = /(\.\d+|(0|[0-9])\d*\.?\d*)([eE][-\+]?\d+)|(0[bB]?[01]+)|(0[oO]?[0-7]+)|(0[xX]?[0-9a-fA-F]+)/




// SourceCharacter but not one of  " or \ or LineTerminator (\r LS PS \n)
var regNoMatch = /?:[^"\\\r\n\u2028\u2029]/

// <LS> <PS> \ EscapeSequence LineContinuation  | x HexDigit HexDigit | u Hex4Digits
var regMatch = /\(?:['"\\bfnrtv\n\r\u2028\u2029]|\r\n)|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}/

// SourceCharacter but not one of EscapeCharacter or LineTerminator
var regNo = /\\[^0-9ux'"\\bfnrtv\n\\\r\u2028\u2029])/

// stringLiteral 
var string_reg_nb = /(?:[^"\n\\\r\u2028\u2029]|\\(?:['"\\bfnrtv\n\r\u2028\u2029]|\r\n)|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}|\\[^0-9ux'"\\bfnrtv\n\\\r\u2028\u2029])*/


