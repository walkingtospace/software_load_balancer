var exec = require('child_process').execSync;
var math = require('mathjs');
var fs = require('fs');
var hostagents = require('../../configs/hostagent.json');
var hostagent = hostagents.hostagent[0];
var numConn = 100; // Total amount of requests to send
var increase = 10; // requests per second
var timeout = 10; //in seconds
var testIterations = 1;
var iterations = 10;
if(process.argv.length > 2)
	numConn = parseInt(process.argv[2]);
if(process.argv.length > 3)
	increase = parseInt(process.argv[3])/iterations;
if(process.argv.length > 4)
	testIterations = parseInt(process.argv[4]);

var resultStr = "Requsts,Time,Min,Max,Avg,Median,Std.Dev.\n";
for (i = 1; i <= iterations; i++){
	var rate = i * increase;
	var result = new Array(testIterations);
	var httperf = "httperf --server " + hostagent.IP + " --port " + hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log";
	// var httperf = "httperf --server thalley.com --hog ";
	console.log(httperf);
	for(j = 0; j < testIterations; j++){
		console.log("Iteration: " + j);
		var httperfRes = exec(httperf).toString();
		var time = httperfRes.split(/[\n]/)[3].split(/[ ]/)[8];
		result[j] = parseFloat(time);
	}
	console.log(result);
	var min = math.min(result);
	var avg = math.mean(result);
	var max = math.max(result);
	var median = math.median(result); //In case of an even number of values, the average of the two middle values is returned. 
	var stddev = math.std(result);
	console.log("Time:\t\t " + time);
	console.log("Min:\t\t " + min);
	console.log("Max:\t\t " + max);
	console.log("Avg:\t\t " + avg);
	console.log("Median:\t\t " + median);
	console.log("Std. Dev.:\t " + stddev);
	resultStr += rate + "," + time + "," + min + "," + max + "," + avg + "," + median + "," + stddev + "\n";
}

// Save to file: [expName]results
var expname = (exec("hostname").toString().split(/[.]/))[1];
fs.writeFile("../results/" + expname + "Rate", resultStr, function(err) {
	if(err) {
		return console.log(err);
	}
	console.log("The file was saved!");
});