var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;
var middleware = require('../controllers/middleware');
var exec = require('child_process').exec;
var childProcess = null;
var queue = [];

exports.connect = function(app) {
	app.get('/', index); 
	app.get('/route/roundrobin', roundrobin); //basic
	app.get('/route/resourcebase/:type', resourcebase); //CPU,MEMORY-based scheduling

	runChild();
}

function runChild() { //for health check of hosts
	childProcess = exec('node ./controllers/childprocess.js');
		
	childProcess.stdout.on('data', function(data) {
    		data = data.replace(/(\r\n|\n|\r)/gm,""); //remove all linebreaks
		
		if(data.indexOf('connect') != -1) {
			console.log(data);
		} else {
			try {
				var json = JSON.parse(data);
				if(queue[json.ip] != undefined) {
					queue[json.ip] = {"cpu": json.cpu, "mem": json.mem};

				//	console.log(Object.keys(queue).length+",");
				} else {
					queue[json.ip] = {"cpu": json.cpu, "mem": json.mem};
				}
			} catch (e) {
				//console.log("json format error"); 
			}	
		}
	});

	childProcess.stderr.on('data', function(data) {
    		console.log('[parent] Child has errors :' + data);
	});

	childProcess.on('close', function(code) {
		console.log('[parent] Child process quit: ' + code);
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
		console.log("No resources");

		res.status(200).send("No available resources");
	}
}

function getPriority(type) {
	var IP;
	var temp;
	
	if(type === "CPU") {
		temp = {"cpu": 99.9999};

		for(var i in queue) {
			if(temp.cpu > parseInt(queue[i].cpu)) {	
				temp = queue[i];
				IP = i;
			}
		}	
	} else if(type === "MEM") {
		temp = {"mem": 99.9999};

		for(var i in queue) {
			if(temp.mem > parseInt(queue[i].mem)) {	
				temp = queue[i];
				IP = i;
			}
		}
	}

	var NO_CPU_RESOURCE = "NOCPU";
	var NO_MEM_RESOURCE = "NOMEM";

	if(temp.cpu !== undefined && temp.cpu >= 90) {
	
		return NO_CPU_RESOURCE;
	} else if(temp.mem !== undefined && temp.mem >= 90) {
	
		return NO_MEM_RESOURCE;
	}

	for(var i=0; i<hostsize ; ++i) {
		if(hosts.hosts[i].IP == IP) {

			return {"IP" : IP, "port" : hosts.hosts[i].port, "status" : temp};
		}
	}

	return undefined;
}

function send(res, resFromHost, info) {
	if(resFromHost === undefined) {
		res.status(200).send("Got error from host " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port);v

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
