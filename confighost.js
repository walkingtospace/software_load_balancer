var fs = require('fs');
var exec = require('child_process').execSync;
var dns = require('dns');
var path;

// Finds and adds all servers to the hosts.json file in the configs folder
// Uses data from the tbreport.log file located in /proj/Reactor/exp/EXPNAME/tbdata/
if(process.argv.length < 3){
	console.log("No path for tbreport.log was given, assuming emulab host");

	//Finds the actual name of the experiment to finde the tbreport.log file
	var expname = (exec("hostname").toString().split(/[.]/))[1];
	var experiments = exec("ls /proj/Reactor/exp").toString().split(/[\n]/);
	for (var i = 0; i < experiments.length; i++)
		if (experiments[i].toLowerCase() == expname){
			path = "/proj/Reactor/exp/" + experiments[i] + "/tbdata/tbreport.log";
			break;
		}
	}
	else
		path = process.argv.slice(2).toString();


// Read the file as lowercase
var file = fs.readFileSync(path).toString().toLowerCase();
//Split the file into strings separated by space so we can finde hostnames
var strings = file.split(/[ \n]+/); 
// Find all hostnames
var nodenames = strings.filter(function(s){return s.indexOf("reactor.") >= 0;}); 
// Find all hostnames that are not a LB or a traffic generator
// Assumes a naming convention where every LB is named LBx (x is an int) and the traffic generator is named Generator
var hostnames = nodenames.filter(function(s){
									var nodename = (s.split(/[.]/))[0]; 
									return nodename.indexOf("lb") < 0 && nodename.indexOf("generator") < 0;
								});

//Create JSON
var hostjson = '{ "hosts": [ ';
var addresses = "ip";
//Insert ip, port and hostname for each hostname
hostnames.forEach(function(hostname){
	dns.lookup(hostname, function onLookup(err, addresses, family) {
		hostjson += '{ "IP":"' + addresses + '","port":"' + constant.SERVER.PORT + '","hostname":"' + hostname + '"},';
	});
});

setTimeout(printHostfile, 100);
function printHostfile(){
	hostjson = hostjson.substring(0, hostjson.length - 1); //Remove ekstra comma
	hostjson += '] }';
	var prettyJSON = JSON.stringify(JSON.parse(hostjson), null, 2);

	//Write to file
	fs.writeFile("./configs/hosts.json", prettyJSON, function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("The file was saved!");
	});

}

