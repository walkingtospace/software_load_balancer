var net = require('net');
var client = new net.Socket();
var interval = null;
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var queue = []; 

(function() {
	for(var i=0; i<hostsize ; ++i) {
		var IP = hosts.hosts[i].IP;
		var client = net.connect(40000, IP, function(data) { //'connect' listener
			console.log('A host has been connected');

			interval = setInterval(writeTo, 5000);
		});
			
		client.on('data', function(data) {
			console.log(data.toString());
		});

		client.on('end', function() {
			console.log('Disconnected');

			if(interval != null) {
				clearInterval(interval);
			}
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

