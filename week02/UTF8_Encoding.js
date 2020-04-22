


// 1 char byte: Unicode code point 0 - 127
// 2 char byte: Unicode code point 128 - 2047
// 3 char byte: Unicode code point 2048 - 0xFFFF
// 4 char byte: Unicode code point 65536 - 0x1FFFFF
// 5 char byte: Unicode code point 0x200000 - 0x3FFFFFF
// 6 char byte: Unicode code point 0x4000000 - 0x7FFFFFFF


const HEXRANGELIST = [
  {
    from: '0x00', // 0
    to: '0x7F' // 127
  },
  {
    from: '0x80', // 128
    to: '0x7FF' // 2047
  },
  {
    from: '0x800', // 2048
    to: '0xFFFF' // 65535
  },
  {
    from: '0x1000', // 65536
    to: '0x10FFFF' // 1114111
  }
]
// 
const BINARYRANGELIST = [
  '0xxxxxxx',
  '110xxxxx10xxxxxx',
  '1110xxxx10xxxxxx10xxxxxx',
  '11110xxx10xxxxxx10xxxxxx10xxxxxx',
]

/**
 * GetRangeUnicode 
 * @param {*} char 
 * @returns index
 */
function GetRangeUnicode(char) {
  char = parseInt(char, 16)
  return HEXRANGELIST.findIndex(e => e.from < char && e.to > char)
}

/**
 * UTF-8 Encoding
 * @param char any one char
 */
function UTF8Encoding(char) {
  if(!char) return;
  // get the char hex code point of the unicode
  const charHex = char.codePointAt().toString(16);
  // get the char binary code point of the unicode, and convert array. e.g '100111000100101'
  const charBinary = char.codePointAt().toString(2).split('');

  // get the range of the char that converted hex code point, and concert array. e.g '1110xxxx10xxxxxx10xxxxxx'
  let rangeBinary = BINARYRANGELIST[GetRangeUnicode(charHex)].split('');

  let cLen = charBinary.length - 1;
  let rLen = rangeBinary.length - 1;

  // fraom
  while(rLen >= 0) {
    if(rangeBinary[rLen] === 'x') {
      rangeBinary[rLen] = cLen < 0 ? '0' : charBinary[cLen];
      cLen--;
    }
    rLen--;
  }
  return {
    binary_utf_8: rangeBinary.join(''),
    hex_utf_8: parseInt(rangeBinary.join(''), 2).toString(16)
  }
}

UTF8Encoding('严')


