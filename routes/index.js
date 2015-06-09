var constant = require('../configs/constants.json');
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;
var middleware = require('../controllers/middleware');
var intervalID = null;
var fork = require('child_process').fork;
var peerListenerProcess = null;
var queue = []; //host information
var requests = require('../configs/requests.json');
var reqStack = [];

exports.connect = function(app) {
	//app.get('/*', resourcebase); //Redirect all requests to resourcebase
	app.get('/route/roundrobin*', roundrobin); //basic
	app.get('/route/resourcebase/:type*', resourcebase); //CPU,MEMORY-based scheduling

	initResource();
	runPeerListener(); 

	intervalID = setInterval(function() { pipe(constant.SERVER.RESOURCE); }, constant.SERVER.TIME_FOR_SHARE);
}

function runPeerListener() { 
	if(peerListenerProcess === null) {
		peerListenerProcess = fork('./controllers/peerListener.js');

		peerListenerProcess.on('message', function(data) { 
			IP = data.toString();  //data : string(IP)
		
			if(reqStack.length > 0) {
				var obj = reqStack.pop();
				console.log("redirect to peer: " + IP);

				if(IP !== constant.SERVER.NOT_AVAILABLE) {
					middleware.redirector(constant.SERVER.REDIRECTION, IP, constant.SERVER.PORT, obj.url, obj.res, send, obj.unit);
				} else {   //Forced-round-robin
					if(hostcount >= (hostsize-1)) {
						hostcount = 0;
					} else {
						hostcount++;
					}	

					//redirect requests to host
				 	console.log("[Forced-roundrobin] Redirect traffic to : " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port); 

					middleware.redirector(constant.SERVER.ORIGIN, hosts.hosts[hostcount].IP, hosts.hosts[hostcount].port, obj.url, obj.res, send, null);
				}
			} else {
				console.log('[parent] stack underflow.');	
			}
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

function initResource() {
	for(var i=0 ; i<hostsize ; ++i) {
		queue[hosts.hosts[i].IP] = {"port" : hosts.hosts[i].port, "CPU" : constant.HOST.INIT_CPU, "MEM" :  constant.HOST.INIT_MEM};
	}
}

function getResource(request) { //param1 : {"type" : CPU||MEM, "workload" : integer}
	for(var key in queue) {
		if(queue[key].CPU > request.CPU && queue[key].MEM > request.MEM) {

			return key; //IP
		}
	}

	return null;
}

function setResource(IP, request, type) {	
	if(type === constant.SERVER.SEND) {	
		queue[IP].CPU = parseInt(queue[IP].CPU) - parseInt(request.CPU);
		queue[IP].MEM = parseInt(queue[IP].MEM) - parseInt(request.MEM);
	} else if(type === constant.SERVER.RESPOND) {
		queue[IP].CPU = parseInt(queue[IP].CPU) + parseInt(request.CPU);
		queue[IP].MEM = parseInt(queue[IP].MEM) + parseInt(request.MEM);
	}
}

function getResourceUnit(type) {
	if(type === constant.SERVER.CPU) {

		return {"CPU" : requests.requests[0].CPU, "MEM" : requests.requests[0].MEM};
	} else if(type === constant.SERVER.MEM) {

		return {"CPU" : requests.requests[1].CPU, "MEM" : requests.requests[1].MEM};
	}
}

function pipe(type, data) { //parent -> childprocess
	if(type === constant.SERVER.SOS){
		peerListenerProcess.send(JSON.stringify(data, null, 2));
	} else if(type === constant.SERVER.RESOURCE) {
		for(var key in queue) {
			if(queue[key].CPU !== undefined && queue[key].MEM !== undefined) {
				var obj = {"IP" : key, "CPU" : queue[key].CPU, "MEM" : queue[key].MEM};

				peerListenerProcess.send(JSON.stringify(obj, null, 2));
			}
		}
	}
}	

function index(req, res, next) {
	res.render('index', { title: 'Meercat Main Page' });
}

function roundrobin(req, res, next) {
	if(req.url === "/favicon.ico") {
	 	res.writeHead(200, {'Content-Type': 'image/x-icon'} );
          res.end(/* icon content here */);

          return;
	}

	if(hostcount >= (hostsize-1)) {
		hostcount = 0;
	} else {
		hostcount++;
	}	

	//redirect requests to host
 	console.log("[roundrobin] Redirect traffic to : " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port); 
console.log(req.url);
	middleware.redirector(constant.SERVER.ORIGIN, hosts.hosts[hostcount].IP, hosts.hosts[hostcount].port, req.url, res, send, null);
}

function resourcebase(req, res, next) {
	if(req.url === "/favicon.ico") {
	 	res.writeHead(200, {'Content-Type': 'image/x-icon'} );
          res.end(/* icon content here */);

          return;
	}

	if(req.url === "/memory") {
		req.params.type = constant.SERVER.MEM;
	} else {
		req.params.type = constant.SERVER.CPU;
	}

	var unit = getResourceUnit(req.params.type);
	var nextHostIP = getResource(unit);

	if(nextHostIP !== null) {
		console.log("[CPU/MEM] Redirect traffic to : " + nextHostIP); 
		setResource(nextHostIP, unit, constant.SERVER.SEND);

		middleware.redirector(constant.SERVER.ORIGIN, nextHostIP, queue[nextHostIP].port, req.url, res, send, unit);
	} else {
		console.log("[parent] No available resources : send S.O.S");

		var obj = {"type" : constant.SERVER.SOS, "CPU" : unit.CPU, "MEM" : unit.MEM};

		pipe(constant.SERVER.SOS, obj);
		reqStack.push({"url" : req.url, "res" : res, "req": req, "unit" : unit}); 
	}
}

function send(res, resFromHost, info, IP, type) {
	if(resFromHost === undefined) {
		res.status(200).send("Got error from host " + IP);

	} else {
		if(info !== null && info !== undefined) {
			var header = "Successfully received response </br>";
			var address = "IP: "+ IP + "</br>"; 
			var resStatus = "RESPONSE CODE: " + resFromHost.statusCode + "</br>";

			if(type === constant.SERVER.ORIGIN) {
				setResource(IP, info, constant.SERVER.RESPOND);

				var CPU = "A host " + IP + " used CPU usage: " + info.CPU + " unit" + "</br>";
				var MEM = "A host " + IP + " used MEM usage: " + info.MEM + " unit" + "</br>";
				var remainCPU = "A host " + IP + " remained CPU usage: " + queue[IP].CPU + " unit" + "</br>";
				var remainMEM = "A host " + IP + " remained MEM usage: " + queue[IP].MEM + "unit" + "</br>";
			} else if(type === constant.SERVER.REDIRECTION){
				var CPU = "My peer " + IP + " used CPU usage: " + info.CPU + " unit" + "</br>";
				var MEM = "My peer " + IP + " used MEM usage: " + info.MEM + " unit" + "</br>";
			} else {
				//Shouldn't be here
			}

			res.status(200).send(header + address + resStatus + CPU + MEM+ remainCPU + remainMEM);
		} else {
			var header = "Successfully received response </br>";
			var address = "IP: " + IP + "</br>"; 
			var resStatus = "RESPONSE CODE: " + resFromHost.statusCode + "</br>";

			res.status(200).send(header + address + resStatus);
		}
	}
}
