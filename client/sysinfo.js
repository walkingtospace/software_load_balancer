// Create server and listen on port 40000
var net = require('net');
var ip = require("ip");

var server = net.createServer(function(socket){
	console.log('Server has been created');

	socket.on('data', function(data){ 
		console.log("resv data");

		socket.write(getSysInfo());
	});
}).listen(40000);

// Returns system information as a JSON object
function getSysInfo(){
	// Exec does so that we can call arbitrary shell commands
	var exec = require('child_process').execSync;
	var cpuCmd = "grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'"
	var memCmd = "free | grep Mem | awk '{print $3/$2 * 100.0}'"
	var cpu = exec(cpuCmd).toString();
	var mem = exec(memCmd).toString();
	var json = '{"ip":' + ip.address() + ' ,"cpu":' + cpu +', "mem":' + mem + '}';
	
	return json;
}
