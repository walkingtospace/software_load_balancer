var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;
var middleware = require('../controllers/middleware');

exports.connect = function(app) {
	app.get('/', index); 
	app.get('/route/roundrobin', roundrobin); //basic
	app.get('/route/resourcebase', resourcebase); //CPU,MEMORY-based scheduling
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
	console.log("[roundrobin] sent traffic to : " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port); 
	middleware.redirector(hosts.hosts[hostcount].IP, hosts.hosts[hostcount].port, res, send);
}

function resourcebase(res, res, next) {
	//get hosts status
	//chooose idle host
	//redirect requests to host
}

function send(res, resFromHost) {
	if(resFromHost === undefined) {
		res.status(200).send("Got error from host " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port);

	} else {
		res.status(200).send("Successfully received response from " + hosts.hosts[hostcount].IP + " port:" + hosts.hosts[hostcount].port + " status:" + resFromHost.statusCode);
	}
}
