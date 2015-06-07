var constant = require('../configs/constants.json');
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;
var middleware = require('../controllers/middleware');
var failoverManager = require('../controllers/failoverManager');
var intervalID = null;
var fork = require('child_process').fork;
var peerListenerProcess = null;
var queue = []; //host information

exports.connect = function(app) {
	app.get('/*', resourcebase); //Redirect all requests to resourcebase
	app.get('/route/roundrobin*', roundrobin); //basic
	app.get('/route/resourcebase/:type*', resourcebase); //CPU,MEMORY-based scheduling

	initResource();
	runPeerListener(); 

	intervalID = setInterval(function() {send(constant.SERVER.RESOURCE);}, TIME_FOR_SHARE);
}

function initResource() {
	for(var i=0 ; i<hostsize ; ++i) {
		queue[hosts.hosts.IP] = {"CPU" : constant.HOST.INIT_CPU, "MEM" :  constant.HOST.INIT_MEM};
	}
}

function getResource(request) { //param1 : {"type" : CPU||MEM, "workload" : integer}
	if(request.type === constant.SERVER.CPU) {
		for(var key in queue) {
			if(queue[key].CPU > request.CPU) {

				return queue[key];
			}
		}
	} else if(request.type === constant.SERVER.MEM) {
		for(var key in queue) {
			if(queue[key].MEM > request.MEM) {

				return queue[key];
			}
		}
	}

	return null;
}

function setResource(IP, request) {
	queue[IP].CPU -= request.CPU;
	queue[IP].MEM -= request.MEM;
}

function send(type, data) {
	if(type === constant.SERVER.SOS){
		//send the size of data
		peerListenerProcess.send(constant.SERVER.SOS);
	} else if(type ==== constant.SERVER.RESOURCE) {
		for(var key in queue) {
			if(queue[key].CPU !== undefined && queue[key].MEM !== undefined) {
				var obj = {"CPU" : queue[key].CPU, "MEM" : queue[key].MEM};
				peerListenerProcess.send(JSON.stringify(obj, null, 2));
			}
		}
		
	}
}	


function runPeerListener() { 
	if(peerListenerProcess === null) {
		peerListenerProcess = fork('./controllers/peerListener.js');

		peerListenerProcess.on('message', function(data) { //data : string(IP)
			data = data.toString();

		});

		peerListenerProcess.on('error', function(data) {
	    		console.log('[parent] peerListener has errors :' + data);
		});

		peerListenerProcess.on('exit', function(data) {
			console.log('[parent] peerListener process quit: ' + data);
			peerListenerProcess = null;
		});
	}
}

/*function runPeerChecker() { //To get resource information of hosts
	if(peerCheckProcess === null) {
		peerCheckProcess = fork('./controllers/peerChecker.js');

		peerCheckProcess.on('message', function(data) {
			if(typeof(data) === "string") {
				try {
					var json = JSON.parse(data);

					if(json.ip != undefined && json.cpu != undefined && json.mem != undefined) {
						queue[json.ip] = {"cpu": json.cpu, "mem": json.mem};	

						if(peerCheckProcess != null) { 	//update slaves with host resource info
							var obj = {"ip" : json.ip , "cpu" : json.cpu, "mem" : json.mem};

							peerCheckProcess.send(obj);
								
						}
					} else {
						console.log("[parent] json parsing error");
					}
				} catch (e) {
					console.log("[parent] json format error"); 
				}	
			}
		});

		peerCheckProcess.on('error', function(data) {
			data = data.toString();
	    		console.log('[parent] peerChecker has errors :' + data);
		});

		peerCheckProcess.on('exit', function(data) {
			data = data.toString();
			console.log('[parent] peerChecker process quit: ' + data);
			hostCheckProcess = null;
		});
	}
}*/

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
	var reqURL = req.url; // remove /route/roundrobin from url
 	console.log("[roundrobin] Redirect traffic to : " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port); 

	middleware.redirector(hosts.hosts[hostcount].IP, hosts.hosts[hostcount].port, reqURL, res, send);
}

function resourcebase(req, res, next) {
	if(req.url === "/memory") {
		req.params.type = constant.SERVER.MEM;
	} else {
		req.params.type = constant.SERVER.CPU;
	}

	var nextHost = getPriority(req.params.type);	

	if(nextHost === undefined) {
		console.log("[CPU/MEM] Redirection failed");	
		console.log("[CPU/MEM] Falling back to roundrobin");
		
		roundrobin(req, res, next);
		// res.status(200).send("Redirection failed");
	} else if(nextHost.IP !== undefined && nextHost.port !== undefined){
		var reqURL = req.url; // remove /route/roundrobin from url
		console.log("[CPU/MEM] Redirect traffic to : " + nextHost.IP + " port:" + nextHost.port); 
		
		middleware.redirector(nextHost.IP, nextHost.port, reqURL, res, send, nextHost);
	} else {
		console.log("No available resources");
		console.log("Falling back to roundrobin");

		roundrobin(req, res, next);
		// res.status(200).send("No available resources");
	}
}

function getPriority(type) { //first-come, first-served
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
	//If no type was given
	else
		return undefined;

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
