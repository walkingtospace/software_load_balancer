var net = require('net');
var constant = require('../configs/constants.json');
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var slaves = require('../configs/slaves.json');
var slavesize = slaves.slaves.length;

exports.nextMaster = function(masterIP, myIP) {
	for(var i = 0;  i< slavesize-1 ; ++i) {
		if(slaves.slaves[i].IP === masterIP) {
			if(slaves.slaves[i+1].IP === myIP) {
				console.log("omg I'm the next master!");

				return true;
			} else {

				return false;
			}
		}
	}

	return false;
}

exports.broadcastToSlaves = function(msg) {
	for(var i=0; i<slavesize ; ++i) {
		var IP = slaves.slaves[i].IP;
		var innerport = slaves.slaves[i].innerport;
		var client = net.connect(innerport, IP, function(data) { //'connect' listener
			console.log('[broadcaster] ' + this.remoteAddress + ' host has been connected');

			this.write(msg);
		});
			
		client.on('data', function(data) {
			console.log('[broadcaster] ' + 'From ' + this.remoteAddress + " : " + data.toString());
		});

		client.on('end', function() {
			console.log('[broadcaster] ' + this.remoteAddress + ' disconnected');
		});

		client.on('error', function() {
			//console.log('err');
		});
	}

}