var exec = require('child_process').execSync;
var fs = require('fs');
var hostagents = require('../configs/hostagent.json');
var hostagent = hostagents.hostagent[0];
var numConn = 100; // Total amount of requests to send
var rate = 100; // requests per second
var timeout = 10; //in seconds
// var httperf = "httperf --server" + hostagent.hostagent.IP + " --port " + hostagent.hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log";
var grep = " | grep 'Total'";
var result = "Number of requsts,Time,Min,Max,Avg,Median,Std. Dev.\n";
for (i = 1; i <= 10; i++){
	numConn = i * rate;
	var httperf = "httperf --server thalley.com --num-conn " + numConn + " --rate 50";
	// var httperf = "httperf --server " + hostagent.IP + " --port " + hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log";
	console.log(httperf);
	var httperfRes = exec(httperf).toString();
	// console.log(httperfRes);
	var time = httperfRes.split(/[\n]/)[3].split(/[ ]/)[8];
	var conTime = httperfRes.split(/[\n]/)[6].split(/[ ]/);
	var min = conTime[4];
	var avg = conTime[6];
	var max = conTime[8];
	var median = conTime[10];
	var stddev = conTime[12];
	console.log("Time:\t\t " + time);
	console.log("Min:\t\t " + min);
	console.log("Max:\t\t " + max);
	console.log("Avg:\t\t " + avg);
	console.log("Median:\t\t " + median);
	console.log("Std. Dev.:\t " + stddev);
	result += numConn + "," + time + "," + min + "," + max + "," + avg + "," + median + "," + stddev + "\n";
}


// var httperfTO = "httperf --server" + hostagent.hostagent.IP + " --port " + hostagent.hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log --timeout " + timeout;


fs.writeFile("results", result, function(err) {
	if(err) {
		return console.log(err);
	}
	console.log("The file was saved!");
});

// var timeTO = exec(httperfTO).toString();