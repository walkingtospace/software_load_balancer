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
var os = require("os");
var cpu = 0;
var mem = 0;
var change = 20;
var prevCpu = 0;
var prevMem = 0;

var json = '{ "ip": "' + ip.address() + '","cpu": "' + cpu +'","mem": "' + mem + '" }';
var prettyJSON = JSON.stringify(JSON.parse(json), null, 2);

// Perform command based on distro
// if(emulab >= 0) // Remove % char from top command; 8th word is the idle cpu
// cpuCmd = "wetop -bn1 | grep 'Cpu(s)' | sed 's/\%/ /g' | awk '{print 100 - $8}'";
// else if (debian >= 0 | ubuntu >= 0)
// 	cpuCmd = "top -bn1 | grep 'Cpu(s)' | awk '{print 100 - $8}'";
// else { //Fall back to ps aux
	var cpuCnt = "grep -c ^processor /proc/cpuinfo";
	cpuCmd = "ps aux  | awk 'BEGIN { sum = 0 }  { sum += $3 }; END { print sum/ " + exec(cpuCnt) + " }'";
// }

var server = net.createServer(function(soc){
	console.log('Server has been created');
	socket = soc;
	soc.on('data', function(data){
		getSysInfo();
		console.log("resv data");
		soc.write(prettyJSON);
		console.log('Send data');
	});
	setInterval(getSysInfo, constant.HOST.POLLING_INTERVAL);
}).listen(constant.HOST.PORT);

function getSysInfo() {
	var startMeasure = cpuAverage();
	setTimeout(function() {
	  //Grab second Measure
	  var endMeasure = cpuAverage();
	 
	  //Calculate the difference in idle and total time between the measures
	  var idleDifference = endMeasure.idle - startMeasure.idle;
	  var totalDifference = endMeasure.total - startMeasure.total;
	 
	  //Calculate the average percentage CPU usage
	  cpu = 100 - ~~(100 * idleDifference / totalDifference);
	 
	  //Output result to console
	  // cpuP = percentageCPU;
	  // console.log(percentageCPU + "% CPU Usage.");
	  mem = exec(memCmd).toString();
	  mem = mem.substring(0, mem.length - 1); //Remove newline

	  json = '{ "ip": "' + ip.address() + '","cpu": "' + cpu +'","mem": "' + mem + '" }';
	  prettyJSON = JSON.stringify(JSON.parse(json), null, 2);
	  // console.log(prettyJSON);
	  if(cpu > (prevCpu + change) || cpu < (prevCpu - change) ||
	  	 mem > prevMem + change || mem < prevMem - change) {
	  	console.log(mem);
	  	console.log(prevMem+change);
	  	prevMem = mem;
	  	prevCpu = cpu;
	  	console.log('Send data');
	  	console.log(prettyJSON);
	  	socket.write(prettyJSON);
	  }
	 
	}, constant.HOST.POLLING_INTERVAL);
}

function cpuAverage() {
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();
 
  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) {
 
    //Select CPU core
    var cpu = cpus[i];
    //Total up the time in the cores tick
    for(type in cpu.times) {
      totalTick += cpu.times[type];
   }     
    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }
 
  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

// function getSysInfo(){
// 	var cpu = exec(cpuCmd).toString();
// 	var mem = exec(memCmd).toString();
	
// 	cpu = cpu.substring(0, cpu.length - 1); //Remove newline
// 	mem = mem.substring(0, mem.length - 1); //Remove newline
	
// 	var json = '{ "ip": "' + ip.address() + '","cpu": "' + cpu +'","mem": "' + mem + '" }';
// 	var prettyJSON = JSON.stringify(JSON.parse(json), null, 2);
	
// 	return prettyJSON;
// }

// function checkStatus() {
// 	var jsonStr = getSysInfo();
// 	var json = JSON.parse(jsonStr);
// 	if(json.cpu > constant.HOST.CPU_THRESHOLD || json.mem > constant.HOST.MEM_THRESHOLD) {
// 		console.log('Send data');
// 		socket.write(jsonStr);
// 	}
// }
