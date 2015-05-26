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
		console.log(sysInfo);
		socket.write(sysInfo);
	});
}).listen(40000);

// Exec does so that we can call arbitrary shell commands
var exec = require('child_process').execSync;
var distro = "uname -a";
var emulab = exec(distro).toString().toLowerCase().indexOf("emulab");
var ubuntu = exec(distro).toString().toLowerCase().indexOf("ubuntu");
var debian = exec(distro).toString().toLowerCase().indexOf("debian");

// Perform command based on distro
var cpuCmd;
if(emulab >= 0) // Remove % char from top command; 8th word is the idle cpu
	cpuCmd = "top -bn1 | grep 'Cpu(s)' | sed 's/\%/ /g' | awk '{print 100 - $8}'";
else if (debian >= 0 | ubuntu >= 0)
	cpuCmd = "top -bn1 | grep 'Cpu(s)' | awk '{print 100 - $8}'";
else { //Fall back to ps aux
	var cpuCnt = "grep -c ^processor /proc/cpuinfo";
	cpuCmd = "ps aux  | awk 'BEGIN { sum = 0 }  { sum += $3 }; END { print sum/ " + exec(cpuCnt) + " }'";
}
	
var memCmd = "free | grep Mem | awk '{print $3/$2 * 100.0}'";

// Returns system information as a JSON object
function getSysInfo(){
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
