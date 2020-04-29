function convertNumberToString(number, hex) {
  var integer = Math.floor(number);
  var fraction = number - integer;

  var string = '';
  while(integer > 0) {
    string = String(integer % hex) + string;
    integer = Math.floor(integer / hex);
  }
  if (fraction > 0) {
    string += '.';
  }

  while (fraction > 0) {
      let integer = Math.floor(fraction * hex);
      string += integer;
      fraction = fraction * hex - integer;
  }
  return string;
}