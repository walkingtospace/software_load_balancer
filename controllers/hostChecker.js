var net = require('net');
var constant = require("../configs/constants.json");
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var queue = [];
var intervalId = null;

(function() {
	intervalId = setInterval(connection, constant.SERVER.TIME_FOR_HOSTCHECK);
})();

function connection() {
	for(var i=0; i<hostsize ; ++i) {
		var IP = hosts.hosts[i].IP;

		if(queue[IP] === undefined) {
			var healthport = hosts.hosts[i].healthport;
			try{
				var client = net.connect(healthport, IP, function(data) { //'connect' listener
					console.log('[hostChecker] ' + this.remoteAddress + ' host has been connected');

					this.on('data', function(data) {
						console.log('[hostChecker] ' + 'From ' + this.remoteAddress + " : " + data.toString());

						process.send(data.toString());
					});

					queue[this.remoteAddress] = this;

					writeTo();
					//setTimeout(writeTo, constant.SERVER.TIMEFORHOST); //for synchronization with queue.push()
				});


				client.on('end', function() {
					console.log('[hostChecker] ' + this.remoteAddress + ' disconnected');
				});

				client.on('error', function() {
					//console.log('err');
				});
			} catch(e) {
				console.log("ERR");
			}
		}
	}
}

function writeTo() {
	for(var soc in queue) {
		queue[soc].write("get\r\n");
	}
}


