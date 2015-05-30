var net = require('net');
//var externalip = require("externalip"); //public IP
var ip = require('ip'); //local IP
var publicip = null;
var interval = null;
var exec = require('child_process').execSync;
var distro = "uname -a";
var emulab = exec(distro).toString().toLowerCase().indexOf("emulab");
var ubuntu = exec(distro).toString().toLowerCase().indexOf("ubuntu");
var debian = exec(distro).toString().toLowerCase().indexOf("debian");
var cpuCmd;
var memCmd = "free | grep Mem | awk '{print $3/$2 * 100.0}'";
var socket = null;
var constant = require('../configs/constants.json');

// Perform command based on distro
if(emulab >= 0) // Remove % char from top command; 8th word is the idle cpu
	cpuCmd = "top -bn1 | grep 'Cpu(s)' | sed 's/\%/ /g' | awk '{print 100 - $8}'";
else if (debian >= 0 | ubuntu >= 0)
	cpuCmd = "top -bn1 | grep 'Cpu(s)' | awk '{print 100 - $8}'";
else { //Fall back to ps aux
	var cpuCnt = "grep -c ^processor /proc/cpuinfo";
	cpuCmd = "ps aux  | awk 'BEGIN { sum = 0 }  { sum += $3 }; END { print sum/ " + exec(cpuCnt) + " }'";
}

var server = net.createServer(function(soc){
	console.log('Server has been created');
	socket = soc;
	soc.on('data', function(data){
		console.log("resv data");
		soc.write(getSysInfo());	
		interval = setInterval(checkStatus, constant.HOST.POLLING_INTERVAL);
	});
}).listen(constant.HOST.PORT);

function getSysInfo(){
	var cpu = exec(cpuCmd).toString();
	var mem = exec(memCmd).toString();
	
	cpu = cpu.substring(0, cpu.length - 1); //Remove newline
	mem = mem.substring(0, mem.length - 1); //Remove newline
	
	var json = '{ "ip": "' + ip.address() + '","cpu": "' + cpu +'","mem": "' + mem + '" }';
	var prettyJSON = JSON.stringify(JSON.parse(json), null, 2);
	
	return prettyJSON;
}

function checkStatus() {
	var json = getSysInfo();

	if(json.cpu > constant.HOST.THRESHOLD) { 

		socket.write(json);
	} 
}

/*
externalip(function (err,ip) {
	publicip = ip;
});
*/
