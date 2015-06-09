function fibonacci(n) {
    if (n < 2)
        return 1;
    else
        return fibonacci(n-2) + fibonacci(n-1);
}
function send(){
	console.log("hello world");
}
function makeMatrix(n) {
    console.log("Make matrix on server");
    var matrix = [];
    //Making matrix linearlized is much faster
    for(var i=0; i<n*n; i++) {
        matrix[i] = 1;
    }
    //Remove matrix from memory
    matrix = [];
    global.gc();
    return "Done";
}
console.time("send");
send();
console.timeEnd("send");
console.time("fib");
fibonacci(40);
console.timeEnd("fib");
console.time("matrix");
makeMatrix(3000);
console.timeEnd("matrix");
