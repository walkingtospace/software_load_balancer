var os = require("os");
var express = require('express');
var constant = require('../configs/constants.json');
var startMeasure = undefined;
var measurments;
var timestamps;
var interval;


function startMeasurement(){
  measurments = [];
  timestamps = [];
  startMeasure = cpuAverage();
  interval = setInterval(addMeasurement, 200);
}

function endMeasurement(){
  var endMeasure = cpuAverage();
  
  //Calculate the difference in idle and total time between the measures
  var idleDifference = endMeasure.idle - startMeasure.idle;
  var totalDifference = endMeasure.total - startMeasure.total;
  
  //Calculate the average percentage CPU usage
  var cpu = 100 - ~~(100 * idleDifference / totalDifference);

  // console.log(cpu)
  return cpu;
}

function addMeasurement(){
  var cpu = endMeasurement();
  var time = Date.now();
  measurments.push(cpu);
  timestamps.push(time);
}

function cpuAverage() {
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();
 
  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) {
 
    //Select CPU core
    var cpu = cpus[i];
    //Total up the time in the cores tick
    for(type in cpu.times) {
      totalTick += cpu.times[type];
   }     
    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }
 
  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}


var app = express();
app.get('/start', function (req, res) {
  console.log("started measurement");
    startMeasurement();
    console.log(startMeasure);
    res.send("Started");
});
app.get('/end*', function (req, res) {
  if(startMeasure == undefined)
    res.send(constant.MEASUREMENT.NOMEASUREMENT);
  else{
    clearInterval(interval);
    var url = req.originalUrl;
    var time = parseInt(url.substring(4)); // Get timestamp
    findNearest(time, function(measurement){
      console.log("CPU Usage: " + measurement.toString());
      res.send(measurement.toString());
    });
  }
});

app.get('/*', function (req, res) {
  console.log("Empty request");
  res.send("Empty request");
});

// Bind to a port
var port = constant.MEASUREMENT.PORT;
app.listen(port);

//Find measurement based on timstamp
function findNearest(time, callback){
  for(i = 0; i < timestamps.length; i++)
    if (timestamps[i] > time){
      callback(measurments[i]);
      break;
    }
}
// startMeasure();
// setTimeout(endMeasure, 10000);