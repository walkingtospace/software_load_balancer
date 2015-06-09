var exec = require('child_process').execSync;
var math = require('mathjs');
var fs = require('fs');
var request = require("sync-request");
var constant = require('../configs/constants.json');
var hosts = require('../configs/hosts.json');
var hostlen = hosts.hosts.length;
var hostagents = require('../configs/hostagent.json');
var hostagent = hostagents.hostagent[0];
var numConn = 100; // Total amount of requests to send
var increase = 20; // requests per second
var timeout = 10; //in seconds
var testIterations = 1;
var iterations = 10;
if(process.argv.length > 2)
	increase = parseInt(process.argv[2])/iterations;
if(process.argv.length > 3)
	rate = parseInt(process.argv[3]);
if(process.argv.length > 4)
	testIterations = parseInt(process.argv[4]);

var resultStr = "Requsts,Time,Min,Max,Avg,Median,Std.Dev.,CPU\n";
for (i = 1; i <= iterations; i++){
	numConn = i * increase;
	var result = new Array(testIterations);
	var cpus = new Array(testIterations);
	var httperf = "httperf --server " + hostagent.IP + " --port " + hostagent.port + " --num-conn " + numConn + " --rate " + increase + " --wlog Y,wlog.log";
	// var httperf = "httperf --server localhost --uri / --port 3000 --num-conn 100 --rate 50";
	console.log(httperf);
	for(j = 0; j < testIterations; j++){
		// Start measuring CPU
		for(k = 0; k < hostlen; k++)
			request('GET', 'http://' + hosts.hosts[k].IP + ':' + constant.MEASUREMENT.PORT + '/start');

		// Send requests
		var httperfRes = exec(httperf).toString();
		var time = Date.now();

		// Get CPU measurements
		cpus[j] = 0;
		for(k = 0; k < hostlen; k++){
			var res = request('GET', 'http://' + hosts.hosts[k].IP + ':' + constant.MEASUREMENT.PORT + '/end' + time);
			console.log(parseFloat(res.getBody().toString()));
			cpus[j] += parseFloat(res.getBody().toString());
		
		}

		cpus[j] = cpus[j]/hostlen;
		// Get time
		var time = httperfRes.split(/[\n]/)[3].split(/[ ]/)[8];
		result[j] = parseFloat(time);
	}

	console.log(result);
	console.log(cpus);
	var min = math.min(result);
	var avg = math.mean(result);
	var max = math.max(result);
	var median = math.median(result); //In case of an even number of values, the average of the two middle values is returned. 
	var stddev = math.std(result);
	var cpu = math.mean(cpus);
	console.log("Time:\t\t " + time);
	console.log("Min:\t\t " + min);
	console.log("Max:\t\t " + max);
	console.log("Avg:\t\t " + avg);
	console.log("Median:\t\t " + median);
	console.log("Std. Dev.:\t " + stddev);
	console.log("CPU:\t\t " + cpu);
	resultStr += numConn + "," + time + "," + min + "," + max + "," + avg + "," + median + "," + stddev + ',' + cpu + "\n";
	
}

// Save to file: [expName]results
var expname = (exec("hostname").toString().split(/[.]/))[1];
fs.writeFile("../results/" + expname + "resultsTotal", resultStr, function(err) {
	if(err) {
		return console.log(err);
	}
	console.log("The file was saved!");
});
