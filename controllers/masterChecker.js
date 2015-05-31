var net = require('net');
var constant = require("../configs/constants.json");
var client = new net.Socket();
var slaves = require('../configs/slaves.json');
var slavesize = slaves.slaves.length;
var masterConnection = null;

(function() {
	for(var i=0; i<slavesize ; ++i) {
		var IP = slaves.slaves[i].IP;
		var innerport = slaves.slaves[i].innerport;
		
		var client = net.connect(innerport, IP, function(data) { //'connect' listener
			console.log('A master has been connected');
			masterConnection = client;
			setInterval(writeTo, constant.SERVER.TIME_FOR_SLAVE);
		});
			
		client.on('data', function(data) {
			
			console.log(data.toString());
		});

		client.on('end', function() {
			console.log('Disconnected');
		});

		client.on('error', function() {
			//console.log('err');
		});

		
	}
})();

function writeTo() {
	masterConnection.write("Are you master?");
}

