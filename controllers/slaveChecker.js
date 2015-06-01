var net = require('net');
var constant = require("../configs/constants.json");
var queue = [];

(function() {
	console.log('[slaveChecker] Slave Listener is listening at port %s', constant.SERVER.INNERPORT);
	var server = net.createServer(function(socket) {
		socket.on('data', function(data){
			console.log("[slaveChecker] Receive ping : " +  data);
			socket.write(constant.SERVER.MASTER); 

			queue.push(socket);
		});
		
	}).listen(constant.SERVER.INNERPORT);
})();

process.on('message', function(m) {
	for(var i in queue) {
		queue[i].write(JSON.stringify(m, null, 2));
	}
});
