# 每周总结可以写在这里

JS 引擎 

```js
async function afoo(){
    console.log("-2")


    await new Promise(resolve => resolve());
    console.log("-1")
}


new Promise(resolve => (console.log("0"), resolve()))
    .then(()=>(
        console.log("1"), 
        new Promise(resolve => resolve())
            .then(() => console.log("1.5")) ));


setTimeout(function(){
    console.log("2");
    
    new Promise(resolve => resolve()) .then(console.log("3"))


}, 0)
console.log("4");
console.log("5");
afoo()


new Promise(res=>res())
  .then(()=>console.log(1)),(2);
new Promise(res=>res())
  .then(()=>console.log(3)),console.log(4);


async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}
async1();
new Promise(function (resolve) {
    console.log('promise1');
    resolve();
}).then(function () {
    console.log('promise2');
});
```