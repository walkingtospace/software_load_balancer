var constant = require('../configs/constants.json');
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;
var middleware = require('../controllers/middleware');
var fork = require('child_process').fork;
var hostCheckProcess = null;
var slaveCheckProcess = null;
var masterCheckProcess = null;
var queue = []; //host information

exports.connect = function(app) {
	app.get('/', index); 
	app.get('/route/roundrobin*', roundrobin); //basic
	app.get('/route/resourcebase/:type*', resourcebase); //CPU,MEMORY-based scheduling

	if(process.env.type === constant.SERVER.MASTER) {	
		this.runHostChecker(); //client
		this.runSlaveChecker(); //listener 
	} else if(process.env.type === constant.SERVER.SLAVE) {
		setInterval(this.runMasterChecker, constant.SERVER.TIME_FOR_MASTERCHECK); //client
	}
}

exports.runMasterChecker = function() {
	if(masterCheckProcess === null) {
		masterCheckProcess = fork('./controllers/masterChecker.js');

		masterCheckProcess.on('message', function(data) {
			console.log(data);
		});

		masterCheckProcess.on('error', function(data) {
	    		console.log('[parent] masterChecker has errors :' + data);
		});

		masterCheckProcess.on('exit', function(data) {
			console.log('[parent] masterChecker process quit: ' + data);
			masterCheckProcess = null;
		});
	}
}

exports.runSlaveChecker = function() { 
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

exports.runHostChecker = function() { //To get resource information of hosts
	if(hostCheckProcess === null) {
		hostCheckProcess = fork('./controllers/hostChecker.js');

		hostCheckProcess.on('message', function(data) {
			if(typeof(data) === "string") {
				try {
					var json = JSON.parse(data);

					if(json.ip != undefined && json.cpu != undefined && json.mem != undefined) {
						queue[json.ip] = {"cpu": json.cpu, "mem": json.mem};	

						if(slaveCheckProcess != null) { 	//update slaves with host resource info
							for(var i in queue) {  //[refactoring needed] can be faster if it can be sent as array, not a object
								slaveCheckProcess.send(queue[i]);
							}	
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
	var reqURL = req.url.substr(17); // remove /route/roundrobin from url
	console.log("[roundrobin] Redirect traffic to : " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port); 
	middleware.redirector(hosts.hosts[hostcount].IP, hosts.hosts[hostcount].port, reqURL, res, send);
}

function resourcebase(req, res, next) {
	var nextHost = getPriority(req.params.type);	

	if(nextHost === undefined) {
		console.log("[CPU/MEM] Redirection failed");	
	
		res.status(200).send("Redirection failed");
	} else if(nextHost.IP !== undefined && nextHost.port !== undefined){
		console.log("[CPU/MEM] Redirect traffic to : " + nextHost.IP + " port:" + nextHost.port); 
		var reqURL = req.url.substr(23); // remove /route/roundrobin from url
		middleware.redirector(nextHost.IP, nextHost.port, reqURL, res, send, nextHost);
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
