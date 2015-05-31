var net = require('net');
var constant = require("../configs/constants.json");
var client = new net.Socket();
var slaves = require('../configs/slaves.json');
var slavesize = slaves.slaves.length;
var queue = []; 
var masterConnection = null;

(function() {
	for(var i=0; i<slavesize ; ++i) {
		var IP = slaves.slaves[i].IP;
		var innerport = slaves.slaves[i].innerport;
		
		var client = net.connect(innerport, IP, function(data) { //'connect' listener
			console.log('A master has been connected');

			setInterval(writeTo, constant.SERVER.TIME_FOR_SLAVE);
		});
			
		client.on('data', function(data) {
			if(data.toString() === constant.SERVER.MASTER) {
				masterConnection = this;
				console.log("Found master : "  + masterConnection);
			}
			
			console.log(data.toString());
		});

		client.on('end', function() {
			console.log('Disconnected');
		});

		queue.push(client);

		client.on('error', function() {
			//console.log('err');
		});

		
	}
})();

function writeTo() {
	for(var i=0; i<slavesize ; ++i) {
		queue[i].write("Are you master?");
	}
}

