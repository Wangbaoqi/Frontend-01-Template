var set = new Set();

var globalProperties = [
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "Array",
  "Date",
  "RegExp",
  "Promise",
  "Proxy",
  "Map",
  "WeakMap",
  "Set",
  "WeakSet",
  "Function",
  "Boolean",
  "String",
  "Number",
  "Symbol",
  "Object",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "Uint8Array",
  "Uint16Array",
  "Uint32Array",
  "Uint8ClampedArray",
  "Atomics",
  "JSON",
  "Math",
  "Reflect"
]


let current;

var queue = []

for(let p in globalProperties) {
  queue.push({
    path: [p],
    Object: this[p]
  })
}

while (queue.length) {
  current = queue.shift();
  if(set.has(current.object)) continue;
  set.add(current.object);


  console.log(current);
  
  for(let p of Object.getOwnPropertyNames(current.object)) {
    var property = Object.getOwnPropertyDescriptor(current.object, p);
    if(property.hasOwnProperty('value') && 
      ((typeof property.value != null) && (typeof property.value == 'object') || (typeof property.value == 'object')) &&
      property.value instanceof Object) {
        queue.push({
          path: current.path.concat([p]),
          object: property.value,
        })
    }
    if(property.hasOwnProperty('get') && (typeof property.get == 'function')){
      queue.push({
        path: current.path.concat([p]),
        object: property.get,
      })
    }
    if(property.hasOwnProperty('set') && (typeof property.set == 'function')){
      queue.push({
        path: current.path.concat([p]),
        object: property.set,
      })
    }
  }
}


