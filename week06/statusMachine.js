function match(string) {
  let state = start;
  for(let s of string) {
    state = state(s)
  }
  return state === end
}
function start(s) {
  if(s === 'a') {
    return foundA
  }else {
    return start
  }
}
function end() {
  return end
}
function foundA(s) {
  if(s === 'b') {
    return foundX
  }else {
    return start(s)
  }
}
function foundX(s) {
  if(s === 'x') {
    return end
  }else {
    return start(s)
  }
}

match('abababx')