var Worker = require('webworker-threads').Worker;
var express = require('express');
var app = express();
var constant = require('../configs/constants.json');

// Add a basic route – index page
app.get('/', function (req, res) {
    res.send('Hello from server');
});

app.get('/compute', function (req, res) {
    console.log("Doing computation on server");
    var worker = new Worker(function(){
        function fibonacci(n) {
            if (n < 2)
                return 1;
            else
                return fibonacci(n-2) + fibonacci(n-1);
        }
        this.onmessage = function (event) {
          
          postMessage(fibonacci(event.data));
        }
    });
    worker.onmessage = function (event) {
        res.send(event.data +"");
        console.log("Compuation done on server");
    };
    worker.postMessage(constant.CLIENT.FIBNUM);
});

function makeMatrix(n) {
    var matrix = [];
    for(var i=0; i<n; i++) {
        matrix[i] = new Array(n);
    }
    return matrix;
}

// Makes an empty array to use up memory and keeps it in memory for a given amount of milliseconds
app.get('/memory', function (req, res) {
    console.log("Make matrix on server");
    var worker = new Worker(function(){
        function makeMatrix(n) {
            var matrix = [];
            //Making matrix linearlized is much faster
            for(var i=0; i<n*n; i++) {
                matrix[i] = 1;
            }
            return "Done";
        }
        this.onmessage = function (event) {
          postMessage(makeMatrix(event.data));
        }
    });
    worker.onmessage = function (event) {
        mat = [];
        global.gc();
        res.send("done");
        console.log("Matrix done on server");
    };
    worker.postMessage(constant.CLIENT.MATRIXSIZE);
});

// Bind to a port
var port = constant.CLIENT.PORT;
app.listen(port);