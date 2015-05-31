var constant = require('../configs/constants.json');
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;
var middleware = require('../controllers/middleware');
var exec = require('child_process').exec;
var hostCheckProcess = null;
var slaveCheckProcess = null;
var masterCheckProcess = null;

var queue = []; //host information

exports.connect = function(app) {
	app.get('/', index); 
	app.get('/route/roundrobin', roundrobin); //basic
	app.get('/route/resourcebase/:type', resourcebase); //CPU,MEMORY-based scheduling

	if(process.env.type === constant.SERVER.MASTER) {	
		this.runHostChecker();
		this.runSlaveChecker();
	} else if(process.env.type === constant.SERVER.SLAVE) {
		this.runMasterChecker();
	}
}

exports.runMasterChecker = function() {
	masterCheckProcess = exec('node ./controllers/masterChecker.js');

	masterCheckProcess.stdout.on('data', function(data) {
    		console.log(data); //respond to ping
	});

	masterCheckProcess.stderr.on('data', function(data) {
    		console.log('[parent] masterChecker has errors :' + data);
	});

	masterCheckProcess.on('close', function(code) {
		console.log('[parent] masterChecker process quit: ' + code);
	});


}

exports.runSlaveChecker = function() {
	slaveCheckProcess = exec('node ./controllers/slaveChecker.js');

	slaveCheckProcess.stdout.on('data', function(data) {
    		//respond to ping
    		console.log(data);
	});

	slaveCheckProcess.stderr.on('data', function(data) {
    		console.log('[parent] slaveChecker has errors :' + data);
	});

	slaveCheckProcess.on('close', function(code) {
		console.log('[parent] slaveChecker process quit: ' + code);
	});

}

exports.runHostChecker = function() { //To get resource information of hosts
	hostCheckProcess = exec('node ./controllers/hostChecker.js');
	
	hostCheckProcess.stdout.on('data', function(data) {
    		data = data.replace(/(\r\n|\n|\r)/gm,""); //remove all linebreaks
		console.log('[parent] '+data);
		if(data.indexOf('connect') != -1) {
			console.log(data); 
		} else {
			try {
				var json = JSON.parse(data);

				if(json.ip != undefined && json.cpu != undefined && json.mem != undefined) {
					queue[json.ip] = {"cpu": json.cpu, "mem": json.mem};	
					//update slaves with queue info
				} else {
					console.log("json parsing error");
				}
			} catch (e) {
				//console.log("json format error"); 
			}	
		}
	});

	hostCheckProcess.stderr.on('data', function(data) {
    		console.log('[parent] hostChecker has errors :' + data);
	});

	hostCheckProcess.on('close', function(code) {
		console.log('[parent] hostChecker process quit: ' + code);
	});
}

function index(req, res, next) {
	res.render('index', { title: 'Meercat Main Page' });
}

function roundrobin(req, res, next) {
	if(hostcount >= (hostsize-1)) {
		hostcount = 0;
	} else {
		hostcount++;
	}	

	//redirect requests to host
	console.log("[roundrobin] Redirect traffic to : " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port); 
	middleware.redirector(hosts.hosts[hostcount].IP, hosts.hosts[hostcount].port, res, send);
}

function resourcebase(req, res, next) {
	var nextHost = getPriority(req.params.type);	

	if(nextHost === undefined) {
		console.log("[CPU/MEM] Redirection failed");	
	
		res.status(200).send("Redirection failed");
	} else if(nextHost.IP !== undefined && nextHost.port !== undefined){
		console.log("[CPU/MEM] Redirect traffic to : " + nextHost.IP + " port:" + nextHost.port); 
		
		middleware.redirector(nextHost.IP, nextHost.port, res, send, nextHost);
	} else {
		console.log("No available resources");

		res.status(200).send("No available resources");
	}
}

function getPriority(type) {
	var IP;
	var temp;
	
	if(type === constant.SERVER.CPU) {
		temp = {"cpu": constant.HOST.CPU_THRESHOLD};

		for(var i in queue) {
			if(temp.cpu > parseInt(queue[i].cpu)) {	
				temp = queue[i];
				IP = i;
			}
		}	
	} else if(type === constant.SERVER.MEM) {
		temp = {"mem": constant.HOST.MEM_THRESHOLD};

		for(var i in queue) {
			if(temp.mem > parseInt(queue[i].mem)) {	
				temp = queue[i];
				IP = i;
			}
		}
	}

	if(temp.cpu !== undefined && temp.cpu >= constant.HOST.CPU_THRESHOLD) {
	
		return constant.SERVER.NO_CPU_RESOURCE;
	} else if(temp.mem !== undefined && temp.mem >= constant.HOST.MEM_THERESHOLD) {
	
		return constant.SERVER.NO_MEM_RESOURCE;
	}

	for(var i=0; i<hostsize ; ++i) { //the lowest-resource-usage-first-served
		if(hosts.hosts[i].IP == IP) {

			return {"IP" : IP, "port" : hosts.hosts[i].port, "status" : temp};
		}
	}

	return undefined;
}

function send(res, resFromHost, info) {
	if(resFromHost === undefined) {
		res.status(200).send("Got error from host " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port);

	} else {
		if(info !== undefined) {
			var header = "Successfully received response </br>";
			var address = "IP: "+ hosts.hosts[hostcount].IP + " PORT: " + hosts.hosts[hostcount].port + "</br>"; 
			var resStatus = "RESPONSE CODE: " + resFromHost.statusCode + "</br>";
			var CPU = "CPU usage: " + info.status.cpu + "%" + "</br>";
			var MEM = "MEM usage: " + info.status.mem + "%";  

			res.status(200).send(header + address+ resStatus + CPU + MEM);
		} else {
			var header = "Successfully received response </br>";
			var address = "IP: "+ hosts.hosts[hostcount].IP + " PORT: " + hosts.hosts[hostcount].port + "</br>"; 
			var resStatus = "RESPONSE CODE: " + resFromHost.statusCode + "</br>";

			res.status(200).send(header + address+ resStatus);
		}
	}
}
