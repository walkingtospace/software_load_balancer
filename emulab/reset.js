var exec = require('child_process').execSync;
var hosts = require('../configs/hosts.json');
var hostagents = require('../configs/hostagent.json');
var constant = require('../configs/constants.json');
var lbs = require('../configs/slaves.json');

var expname = (exec("hostname").toString().split(/[.]/))[1];
var experiments = exec("ls /proj/Reactor/exp").toString().split(/[\n]/);
for (var i = 0; i < experiments.length; i++)
	if (experiments[i].toLowerCase() == expname){
		expname = "/proj/Reactor/exp/" + experiments[i] + "/tbdata/tbreport.log";
		break;
	}

hosts.hosts.forEach(function(host){
    var ssh = "ssh thalley@" + host.IP + " ";
    exec(ssh + "'pkill node'");
    exec(ssh + "/proj/Reactor/software_load_balancer/emulab/" + expname + "/clientstartupscript.sh");
});

// for each lb:
//     exec("killall node")
//     exec("/proj/Reactor/software_load_balancer/emulab/" + expName + "/lbstartupscript.sh")

// for each host:
//     exec("killall node")
//     exec("/proj/Reactor/software_load_balancer/emulab/" + expName + "/hastartupscript.sh")