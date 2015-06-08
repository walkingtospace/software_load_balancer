var exec = require('child_process').execSync;
var sshexec = require('ssh-exec');
var hosts = require('../configs/hosts.json');
var hostagents = require('../configs/hostagent.json');
var constant = require('../configs/constants.json');
var lbs = require('../configs/slaves.json');
var fs = require('fs');

var expname = (exec("hostname").toString().split(/[.]/))[1];
var experiments = exec("ls /proj/Reactor/exp").toString().split(/[\n]/);
for (var i = 0; i < experiments.length; i++)
    if (experiments[i].toLowerCase() == expname){
        expname = experiments[i];
        break;
    }

var printString = '';
var ssh = 'ssh -oStrictHostKeyChecking=no thalley@';
var scriptPath = ' /proj/Reactor/software_load_balancer/emulab/';
var end = ' </dev/null >/dev/null 2>&1 & \n'

// End-hosts
hosts.hosts.forEach(function(host){
    var sshIP = ssh + host.IP;
    var cmd = sshIP + ' pgrep node || true';
    var pids = exec(cmd).toString().split(/[\n]/);
    pids.forEach(function(pid){
     cmd = sshIP + ' kill ' + pid + ' || true'
     if(parseInt(pid) > 0)
             exec(cmd);
    });
    printString += ssh + host.hostname + scriptPath + expname + '/clientstartupscript.sh' + end;
});

// LBs
var masterStarted = false;
lbs.slaves.forEach(function(lb){
    var sshIP = ssh + lb.IP;
    var cmd = sshIP + ' pgrep node || true';
    var pids = exec(cmd).toString().split(/[\n]/);
    pids.forEach(function(pid){
     cmd = sshIP + ' kill ' + pid + ' || true'
     if(parseInt(pid) > 0)
             exec(cmd);
    });
    if(expname == "MeercatTest"){
        if(!masterStarted){
            printString += ssh + lb.hostname + scriptPath + expname + '/master.sh' + end;
            masterStarted = true;
        }
        else
            printString += ssh + lb.hostname + scriptPath + expname + '/slave.sh' + end;
    }
    else
        printString += ssh + lb.hostname + scriptPath + expname + '/lbstartupscript.sh' + end;
});

hostagents.hostagent.forEach(function(ha){
    var sshIP = ssh + ha.IP;
    var cmd = sshIP + ' pgrep node || true';
    var pids = exec(cmd).toString().split(/[\n]/);
    pids.forEach(function(pid){
     cmd = sshIP + ' kill ' + pid + ' || true'
     if(parseInt(pid) > 0)
             exec(cmd);
    });
    printString += ssh + ha.hostname + scriptPath + expname + '/hastartupscript.sh' + end;
});


// Write to fiel
fs.writeFile("restart.sh", printString, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
    // Make file executable
    exec('chmod +x restart.sh');
    // exec('./reset.sh &');
});



// Host agent
// var HA = hostagents.hostagent

// for each host:
//     exec("killall node")
//     exec("/proj/Reactor/software_load_balancer/emulab/" + expName + "/hastartupscript.sh")
