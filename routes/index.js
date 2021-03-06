var constant = require('../configs/constants.json');
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;
var middleware = require('../controllers/middleware');
var failoverManager = require('../controllers/failoverManager');
var masterIP = null;
var myIP = null;

var ip = require('ip'); //local IP
var fork = require('child_process').fork;
var hostCheckProcess = null;
var slaveCheckProcess = null;
var masterCheckProcess = null;
var mastercheckerTimerID = null;
var hostcheckerTimerID = null;
var queue = []; //host information

exports.connect = function(app) {
	app.get('/*', resourcebase); //Redirect all requests to resourcebase
	app.get('/route/roundrobin*', roundrobin); //basic
	app.get('/route/resourcebase/:type*', resourcebase); //CPU,MEMORY-based scheduling

	myIP = ip.address();

	if(process.env.type === constant.SERVER.MASTER) {	
		runHostChecker();
		runSlaveChecker(); //listener 
	} else if(process.env.type === constant.SERVER.SLAVE) {
		mastercheckerTimerID = setInterval(runMasterChecker, constant.SERVER.TIME_FOR_MASTERCHECK); //client
	}
}

function runMasterChecker() {
	if(masterCheckProcess === null) {
		masterCheckProcess = fork('./controllers/masterChecker.js');

		masterCheckProcess.on('message', function(data) {
			data = data.toString();
			//console.log( '[parent] Get resource info : '+ data);

			if(typeof(data) === "string") {
				try {
					var json = JSON.parse(data);

					if(json.master != undefined) {
						masterIP = json.ip;
					}
					
					if(json.ip != undefined && json.cpu != undefined && json.mem != undefined) { //store host resource info
						queue[json.ip] = {"cpu": json.cpu, "mem": json.mem};
					} 
				} catch (e) {
					console.log("[parent] json format error"); 
				}	
			}
		});

		masterCheckProcess.on('error', function(data) {
	    		console.log('[parent] masterChecker has errors : ' + data);
		});

		 //assumption : there is the only case masterCheckerProcess is quit-> lost master
		masterCheckProcess.on('exit', function(data) {
			console.log('[parent] masterChecker process quit: ' + data);
			masterCheckProcess = null;

			if(failoverManager.nextMaster(masterIP, myIP) === true) {
				clearInterval(mastercheckerTimerID); //quit masterchecker

				//run slavechecker
				process.env.type = constant.SERVER.MASTER;

				runHostChecker();
				runSlaveChecker(); //listener 

				//broadcast : "I am a master"
				var msg = "I'm a master";
				failoverManager.broadcastToSlaves(msg);
			} 
		});
/*
		masterCheckProcess.on('close', function(data) {
			console.log('[parent] masterChecker process close: ' + data);
			masterCheckProcess = null;
		});
*/
	}
}

function runSlaveChecker() { 
	if(slaveCheckProcess === null) {
		slaveCheckProcess = fork('./controllers/slaveChecker.js');

		slaveCheckProcess.on('message', function(data) {
			
		});

		slaveCheckProcess.on('error', function(data) {
	    		console.log('[parent] slaveChecker has errors :' + data);
		});

		slaveCheckProcess.on('exit', function(data) {
			console.log('[parent] slaveChecker process quit: ' + data);
			slaveCheckProcess = null;
		});
	}
}

function runHostChecker() { //To get resource information of hosts
	if(hostCheckProcess === null) {
		hostCheckProcess = fork('./controllers/hostChecker.js');

		hostCheckProcess.on('message', function(data) {
			if(typeof(data) === "string") {
				try {
					var json = JSON.parse(data);

					if(json.ip != undefined && json.cpu != undefined && json.mem != undefined) {
						queue[json.ip] = {"cpu": json.cpu, "mem": json.mem};	

						if(slaveCheckProcess != null) { 	//update slaves with host resource info
							var obj = {"ip" : json.ip , "cpu" : json.cpu, "mem" : json.mem};

							slaveCheckProcess.send(obj);
								
						}
					} else {
						console.log("[parent] json parsing error");
					}
				} catch (e) {
					console.log("[parent] json format error"); 
				}	
			}
		});

		hostCheckProcess.on('error', function(data) {
			data = data.toString();
	    		console.log('[parent] hostChecker has errors :' + data);
		});

		hostCheckProcess.on('exit', function(data) {
			data = data.toString();
			console.log('[parent] hostChecker process quit: ' + data);
			hostCheckProcess = null;
		});
	}
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
	var reqURL = req.url; // remove /route/roundrobin from url
 	console.log("[roundrobin] Redirect traffic to : " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port); 

	middleware.redirector(hosts.hosts[hostcount].IP, hosts.hosts[hostcount].port, reqURL, res, send);
}

function resourcebase(req, res, next) {
	if(req.url === "/memory")
		req.params.type = constant.SERVER.MEM;
	else
		req.params.type = constant.SERVER.CPU;

	var nextHost = getPriority(req.params.type);
	console.log(queue);
	if(nextHost === undefined) {
		console.log("[CPU/MEM] Redirection failed");	
		console.log("[CPU/MEM] Falling back to roundrobin");
		roundrobin(req, res, next);
		// res.status(200).send("Redirection failed");
	} else if(nextHost.IP !== undefined && nextHost.port !== undefined){
		console.log("[CPU/MEM] Redirect traffic to : " + nextHost.IP + " port:" + nextHost.port); 
		
		var reqURL = req.url; // remove /route/roundrobin from url
		middleware.redirector(nextHost.IP, nextHost.port, reqURL, res, send, nextHost);
	} else {
		console.log("No available resources");
		console.log("Falling back to roundrobin");
		roundrobin(req, res, next);

		// res.status(200).send("No available resources");
	}
}

function getPriority(type) {
	var IP;
	var temp = 100;
	
	if(type === constant.SERVER.CPU) {
		for(var i in queue) {
			if(temp > parseInt(queue[i].cpu)) {	
				temp = queue[i].cpu;
				IP = i;
			}
		}	
	} else if(type === constant.SERVER.MEM) {
		temp = 200; //Use both CPU and MEM usage here
		for(var i in queue) {
			if(temp > (parseFloat(queue[i].mem) + parseFloat(queue[i].cpu))) {	
				temp = queue[i].mem;
				IP = i;
			}
		}
	}
	//If no type was given
	else
		return undefined;
	if(temp == 100) //If all servers are at 100%, fallback to roundrobin
		return undefined;

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
