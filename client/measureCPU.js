var os = require("os");
var express = require('express');
var constant = require('../configs/constants.json');
var startMeasure = undefined;
function startMeasurement(){
	startMeasure = cpuAverage();
}

function endMeasurement(){
	var endMeasure = cpuAverage();
	
	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	var totalDifference = endMeasure.total - startMeasure.total;
	
	//Calculate the average percentage CPU usage
	var cpu = 100 - ~~(100 * idleDifference / totalDifference);

	console.log(cpu)
	return cpu;
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
app.get('/end', function (req, res) {
	if(startMeasure == undefined)
		res.send(constant.MEASUREMENT.NOMEASUREMENT);
	else
    	res.send(endMeasurement().toString());
});

app.get('/*', function (req, res) {
	console.log("wat");
});

// Bind to a port
var port = constant.MEASUREMENT.PORT;
app.listen(port);


// startMeasure();
// setTimeout(endMeasure, 10000);