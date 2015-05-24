// Create server and listen on port 40000
var net = require('net');
//var externalip = require("externalip"); //public IP
var ip = require('ip'); //local IP
var publicip = null;

var server = net.createServer(function(socket){
	console.log('Server has been created');

	socket.on('data', function(data){
		console.log("resv data");
		var sysInfo = getSysInfo();
		console.log(sysInfo)
		socket.write(sysInfo);
	});
}).listen(40000);

// Returns system information as a JSON object
function getSysInfo(){
	// Exec does so that we can call arbitrary shell commands
	var exec = require('child_process').execSync;
	var cpuCmd = "grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'";
	var memCmd = "free | grep Mem | awk '{print $3/$2 * 100.0}'";
	var cpu = exec(cpuCmd).toString();
	var mem = exec(memCmd).toString();
	cpu = cpu.substring(0, cpu.length - 1); //Remove newline
	mem = mem.substring(0, mem.length - 1); //Remove newline
	var json = '{ "ip": "' + ip.address() + '","cpu": "' + cpu +'","mem": "' + mem + '" }';
	var prettyJSON = JSON.stringify(JSON.parse(json), null, 2);
	return prettyJSON;
}

/*
externalip(function (err,ip) {
	publicip = ip;
});
*/
