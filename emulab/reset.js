var exec = require('child_process').execSync;
var hosts = require('../configs/hosts.json');
var hostagents = require('../configs/hostagent.json');
var constant = require('../configs/constants.json');
var lbs = require('../configs/slaves.json');
hosts.hosts.forEach(function(host) {
    var ssh = "ssh thalley@" + host.IP + " ";
    exec(ssh + "killall node");
    // exec("/proj/Reactor/software_load_balancer/emulab/" + expName + "/clientstartupscript.sh")
});

// for each lb:
//     exec("killall node")
//     exec("/proj/Reactor/software_load_balancer/emulab/" + expName + "/lbstartupscript.sh")

// for each host:
//     exec("killall node")
//     exec("/proj/Reactor/software_load_balancer/emulab/" + expName + "/hastartupscript.sh")