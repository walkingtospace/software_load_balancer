var net = require('net');
var constant = require("../configs/constants.json");
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var queue = [];

(function() {
	for(var i=0; i<hostsize ; ++i) {
		var IP = hosts.hosts[i].IP;
		var healthport = hosts.hosts[i].healthport;
		var client = net.connect(healthport, IP, function(data) { //'connect' listener
			console.log('[hostChecker] ' + this.remoteAddress + ' host has been connected');

			setTimeout(writeTo, constant.SERVER.TIMEFORHOST); //for synchronization with queue.push()
		});

		client.on('data', function(data) {
			console.log('[hostChecker] ' + 'From ' + this.remoteAddress + " : " + data.toString());

			process.send(data.toString());
		});

		client.on('end', function() {
			console.log('[hostChecker] ' + this.remoteAddress + ' disconnected');
		});

		client.on('error', function() {
			//console.log('err');
		});

		queue.push(client);
	}
})();

function writeTo() {
	for(var i=0; i<hostsize ; ++i) {
		queue[i].write("get\r\n");
	}
}


