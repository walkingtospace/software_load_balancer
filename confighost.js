// Finds and adds all servers to the hosts.json file in the configs folder
// Uses data from the tbreport.log file located in /proj/Reactor/exp/EXPNAME/tbdata/
if(process.argv.length < 3){
	console.log("No path for tbreport.log was given");
	return;
}
var fs = require('fs');
//path of the tbreport.log file
var path = process.argv.slice(2).toString();
// Read the file as lowercase
var file = fs.readFileSync(path).toString().toLowerCase();
//Split the file into strings separated by space so we can finde hostnames
var strings = file.split(/[ \n]+/); 
// Find all hostnames
var hostnames = strings.filter(function(s){return s.indexOf("reactor.") >= 0;}); 
// Find all hostnames that are not a LB or a traffic generator
// Assumes a naming convention where every LB is named LBx (x is an int) and the traffic generator is named Generator
var servers = hostnames.filter(function(s){var nodename = (s.split(/[.]/))[0]; return nodename.indexOf("lb") < 0 && nodename.indexOf("generator") < 0;});

//Create JSON
var hostjson = '{ "hosts": [';
servers.forEach(function(server){hostjson += '{ "IP":"' + server + '","port":' + "3000" + '},'});
hostjson = hostjson.substring(0, hostjson.length - 1); //Remove ekstra comma
hostjson += '] }';
var prettyJSON = JSON.stringify(JSON.parse(hostjson), null, 2)

//Write to file
fs.writeFile("./configs/hosts.json", prettyJSON, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
