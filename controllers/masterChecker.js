var net = require('net');
var constant = require("../configs/constants.json");
var slaves = require('../configs/slaves.json');
var slavesize = slaves.slaves.length;
var queue = []; 
var masterConnection = null;

(function() {
	for(var i=0; i<slavesize ; ++i) {
		var IP = slaves.slaves[i].IP;
		var innerport = slaves.slaves[i].innerport;
	
		var client = net.connect(innerport, IP, function(data) { //'connect' listener
			console.log('[masterChecker] A master has been connected : ' + this.remoteAddress);

			setInterval(writeTo, constant.SERVER.TIME_FOR_SLAVE);
		});
			
		client.on('data', function(data) {
			if(data.toString() === constant.SERVER.MASTER) { //alive ping
				masterConnection = this;
				console.log("[masterChecker] Found master address : " + masterConnection.remoteAddress);

				var json = {"ip" : masterConnection.remoteAddress, "master" : true};

				process.send(JSON.stringify(json, null, 2));
			} else { //resource info
				//console.log("[masterChecker] Get resource info : " + data);
			
				var array = data.toString().split("|");
				for(var key in array) {
					if(array[key].length > 0) {
						process.send(array[key].toString()); //format: string
					}
				}
			}
		});

		client.on('end', function() {
			console.log("[masterChecker] We've lost our master");
			
			process.exit(); //for re-execution
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

