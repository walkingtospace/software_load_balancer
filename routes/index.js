var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var hostcount = 0;

exports.connect = function(app) {
	app.get('/', index); 
	app.get('/route/roundrobin', roundrobin); //basic
	app.get('/route/resourcebase', resourcebase); //CPU,MEMORY-based scheduling
}

function index(req, res, next) {
	res.render('index', { title: 'Meercat Main Page' });
}

function roundrobin(req, res, next) {
	if(hostcount > (hostsize-1)) {
		hostcount = 0;
	} else {
		hostcount++;
	}	

	//redirect requests to host
	
}

function resourcebase(res, res, next) {
	//get hosts status
	//chooose idle host
	//redirect requests to host
}
