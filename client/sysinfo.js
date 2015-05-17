// Returns system information as a JSON object
function getSysInfo(){
	// Exec does so that we can call arbitrary shell commands
	var exec = require('child_process').execSync;
	var cpuCmd = "grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'"
	var memCmd = "free | grep Mem | awk '{print $3/$2 * 100.0}'"
	var cpu = exec(cpuCmd).toString();
	var mem = exec(memCmd).toString();
	var json = '{"cpu":' + cpu +', "mem":' + mem + '}';
	return json;
}

// Create server and listen on port 40000
var net = require('net');
net.createServer(function(socket){
    socket.write(getSysInfo());
}).listen(40000);


// Example way to connect to server and get sysinfo
/*
var net = require('net');
var client = net.connect({port: 40000},
    function() { //'connect' listener
  console.log('connected to server!');
});
client.on('data', function(data) {
  console.log(data.toString());
  client.end();
});
client.on('end', function() {
  console.log('disconnected from server');
});
*/