var exec = require('child_process').execSync;
var math = require('mathjs');
var fs = require('fs');
var syncRequest = require("sync-request");
var request = require("request");
var constant = require('../../configs/constants.json');
var hosts = require('../../configs/hosts.json');
var hostlen = hosts.hosts.length;
var hostagents = require('../../configs/hostagent.json');
var hostagent = hostagents.hostagent[0];
var numConn = 100; // Total amount of requests to send
var increase = 20; // requests per second
var timeout = 10; //in seconds
var rate = 20;
var testIterations = 1;
var iterations = 10;
if(process.argv.length > 2)
	increase = parseInt(process.argv[2])/iterations;
if(process.argv.length > 3)
	rate = parseInt(process.argv[3]);
if(process.argv.length > 4)
	testIterations = parseInt(process.argv[4]);

var resultStr = "Requsts,Avg,Min,Max,Median,Std.Dev.\n";
var cpuResultStr = "Requsts,Avg,Min,Max,Median,Std.Dev.\n";
for (i = 1; i <= iterations; i++){
	numConn = i * increase;
	var result = new Array(testIterations);
	var cpus = new Array(testIterations);
	var httperf = "httperf --server " + hostagent.IP + " --port " + hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log";
	// var httperf = "httperf --server localhost --uri / --port 3000 --num-conn 100 --rate 50";
	console.log(httperf);
	for(j = 0; j < testIterations; j++){
		console.log("Iteration: " + j);
		// Start measuring CPU
		console.log("Sending start measures to hosts");
		for(k = 0; k < hostlen; k++){
			process.stdout.write(k + ", ");
			syncRequest('GET', 'http://' + hosts.hosts[k].IP + ':' + constant.MEASUREMENT.PORT + '/start' + (hostlen - k));
		}

		// Send requests
		console.log("\nSending requests");
		var httperfRes = exec(httperf).toString();
		var time = Date.now();

		// Get CPU measurements
		console.log("Getting CPU measurements");
		cpus[j] = 0;
		for(k = 0; k < hostlen; k++){
			//Block request with timestamp
			process.stdout.write(k + ", ");
			var res = syncRequest('GET', 'http://' + hosts.hosts[k].IP + ':' + constant.MEASUREMENT.PORT + '/end' + time);
			cpus[j] += parseFloat(res.getBody().toString());
		
		}

		cpus[j] = cpus[j]/hostlen;
		// Get time
		var time = httperfRes.split(/[\n]/)[3].split(/[ ]/)[8];
		result[j] = parseFloat(time);
	}

	console.log('\n' + result);
	console.log(cpus);
	var min = math.min(result);
	var avg = math.mean(result);
	var max = math.max(result);
	var median = math.median(result); //In case of an even number of values, the average of the two middle values is returned. 
	var stddev = math.std(result);
	var cpuMin = math.min(cpus);
	var cpuAvg = math.mean(cpus);
	var cpuMax = math.max(cpus);
	var cpuMedian = math.median(cpus); //In case of an even number of values, the average of the two middle values is returned. 
	var cpuStddev = math.std(cpus);
	console.log("Time:\t\t " + time);
	console.log("Min:\t\t " + min);
	console.log("Max:\t\t " + max);
	console.log("Avg:\t\t " + avg);
	console.log("Median:\t\t " + median);
	console.log("Std. Dev.:\t " + stddev);
	console.log("CPU:\t\t " + cpuAvg);
	resultStr += numConn + "," + avg + "," + min + "," + max + "," + median + "," + stddev + "\n";
	cpuResultStr += numConn + "," + cpuAvg + "," + cpuMin + "," + cpuMax + "," + cpuMedian + "," + cpuStddev + "\n";
	
}

// Save to file: [expName]results
var expname = (exec("hostname").toString().split(/[.]/))[1];
fs.writeFile("../results/" + expname + "Total", resultStr, function(err) {
	if(err) {
		return console.log(err);
	}
	console.log("The file was saved!");
});
fs.writeFile("../results/" + expname + "Cpu", cpuResultStr, function(err) {
	if(err) {
		return console.log(err);
	}
	console.log("The file was saved!");
});

