var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var cpuSet = false;
var memSet = false;
var cpu = 0;
var mem = 0;
var time = 0;
var cpuCmd, memCmd, cpuChild, memChild;
if(process.argv.length < 3){
	console.log("Usages: node stress.js <CPU> (in %)");
	console.log("Usages: node stress.js <CPU> (in %) <MEM> in megabytes");
	console.log("Usages: node stress.js <CPU> (in %) <MEM> in megabytes <TIME> in milliseconds");
	console.log("Example: node stress.js 50 10000 10000 - Stress CPU by 50%, allocate 10GB in memory for 10 seconds");
	console.log("If time is 0 or unset, it will run until killed");
	process.exit();
}
if(process.argv.length > 2){
	cpuSet = true;
	cpu = process.argv[2];
	cpuCmd = "stress-ng -c 2 -l " + cpu
}
if(process.argv.length > 3){
	execSync("gcc memstress.c -o memstress");
	memSet = true;
	mem = process.argv[3];
	memCmd = "./memstress " + mem;
}
if(process.argv.length > 4){
	time = process.argv[4];
	memCmd += " " + time;
}

console.log("Stressing server with " + cpu + "% CPU and " + mem + " megabytes of memory");

if(cpuSet)
	cpuChild = exec(cpuCmd);
if(memSet)
	memChild = exec(memCmd);
if(time == 0)
	;
else
	setTimeout(killall, time);

function killall(){
	cpuChild.kill();
	memChild.kill();
}
