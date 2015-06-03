var Worker = require('webworker-threads').Worker;
var express = require('express');
var os = require('os');
var app = express();
var constant = require('../configs/constants.json');
var OneGB = 1028*1028*1028;
//Each element is 8 bytes; 2.71 is a magic number that somehow makes
// sizeOfMatrix actual represent the size (found by measurement)
var sizeOfMatrix = constant.CLIENT.MATRIXSIZE * constant.CLIENT.MATRIXSIZE * 8 * 2.71;

// Add a basic route – index page
app.get('/', function (req, res) {
    res.send('Hello from server');
});


//CPU heavy task
app.get('/compute', function (req, res) {
    console.log("Doing computation on server");
    //Spawn thread to do computation
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

// Memory heavy task
// Makes an empty array to use up memory
var running = 0;
app.get('/memory', function (req, res) {
    var worker = new Worker(function(){
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
        this.onmessage = function (event) {
          postMessage(makeMatrix(event.data));
        }
    });
    worker.onmessage = function (event) {
        res.send("done");
        console.log("Matrix done on server");
        running--;
    };

    // Limit total memory usage so that we avoid server crash
    function checkMemory(){
        if ((running * sizeOfMatrix) > (constant.CLIENT.MAXMEMUSE * OneGB)){
            setTimeout(checkMemory, 2000);
        }
        else{
            worker.postMessage(constant.CLIENT.MATRIXSIZE);
            running++;
        }
            
    }
    checkMemory();
});

// Bind to a port
var port = constant.CLIENT.PORT;
app.listen(port);