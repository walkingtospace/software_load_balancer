var net = require('net');
var constant = require("../configs/constants.json");
var client = new net.Socket();
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var queue = []; 

(function() {
	for(var i=0; i<hostsize ; ++i) {
		var IP = hosts.hosts[i].IP;
		var client = net.connect(constant.HOST.PORT, IP, function(data) { //'connect' listener
			console.log('A host has been connected');
			//interval = setInterval(writeTo, 5000);
			setTimeout(writeTo, constant.SERVER.TIMEFORHOST);
		});
			
		client.on('data', function(data) {
			console.log(data.toString());
		});

		client.on('end', function() {
			console.log('Disconnected');

			/*if(interval != null) {
				clearInterval(interval);
			}*/
		});

		client.on('error', function() {
			console.log('err');
		});

		queue.push(client);
	}
})();

function writeTo() {
	for(var i=0; i<hostsize ; ++i) {
		queue[i].write("get\r\n");
	}
}

