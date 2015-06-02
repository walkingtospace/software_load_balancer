// Include the cluster module
var cluster = require('cluster');
var timeouts = [];
function errorMsg() {
  console.error("Something must be wrong with the connection ...");
}
// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    cluster.on('fork', function(worker) {
      timeouts[worker.id] = setTimeout(errorMsg, 120000);
    });

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        clearTimeout(timeouts[worker.id]);
        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
            cluster.fork();

        });

// Code to run if we're in a worker process
} else {
    var express = require('express');
    var app = express();
    var constant = require('../configs/constants.json');
    var id = cluster.worker.id;

    // Add a basic route – index page
    app.get('/', function (req, res) {
        res.send('Hello from Worker ' + id);
    });

    app.get('/compute', function (req, res) {
        console.log("Doing computation on worker " + id);
        function fibonacci(n) {
            if (n < 2)
                return 1;
            else
                return fibonacci(n-2) + fibonacci(n-1);
        }
        res.send(fibonacci(constant.CLIENT.FIBNUM)+"");
        console.log("Compuation done on worker " + id);
    });

    // Makes an empty array to use up memory and keeps it in memory for a given amount of milliseconds
    app.get('/memory', function (req, res) {
    	console.log("Make matrix on worker " + id);
        function makeMatrix(n) {
            var matrix = [];
            for(var i=0; i<n; i++) {
                matrix[i] = new Array(n);
            }
            return matrix;
        }
        var mat = makeMatrix(constant.CLIENT.MATRIXSIZE);
        //Makes the matrix stay in memory for a certain amount of time
        setTimeout(respond, constant.CLIENT.MEMORYDELAY);
        function respond(){
            mat = [];
            global.gc();
            res.send("done");
            console.log("Matrix done on worker " + id);
        }
    });

    // Bind to a port
    var port = constant.CLIENT.PORT;
    app.listen(port);
    console.log('Worker ' + id + ' running on port ' +  port + ' !');
}