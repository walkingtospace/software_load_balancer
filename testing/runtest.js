var exec = require('child_process').execSync;
var fs = require('fs');
var hostagents = require('../configs/hostagent.json');
var hostagent = hostagents.hostagent[0];
var numConn = 100; // Total amount of requests to send
var rate = 10; // requests per second
var timeout = 10; //in seconds
// var httperf = "httperf --server" + hostagent.hostagent.IP + " --port " + hostagent.hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log";
var grep = " | grep 'Total'";
var result = "";
for (i = 1; i <= 10; i++){
	numConn = i * 10;
	// var httperf = "httperf --server thalley.com --num-conn " + numConn + " --rate 50";
	var httperf = "httperf --server " + hostagent.IP + " --port " + hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log";
	console.log(httperf);
	var time = (exec(httperf + grep).toString().split(/[ ]/))[8];
	result += numConn + "," + time + "\n";
}


// var httperfTO = "httperf --server" + hostagent.hostagent.IP + " --port " + hostagent.hostagent.port + " --num-conn " + numConn + " --rate " + rate + " --wlog Y,wlog.log --timeout " + timeout;


fs.writeFile("results", result, function(err) {
	if(err) {
		return console.log(err);
	}
	console.log("The file was saved!");
});

// var timeTO = exec(httperfTO).toString();