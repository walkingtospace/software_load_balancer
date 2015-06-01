var net = require('net');
var constant = require("../configs/constants.json");
var queue = [];
var resourceBuffer = [];

(function() {
	console.log('[slaveChecker] Slave Listener is listening at port %s', constant.SERVER.INNERPORT);
	var server = net.createServer(function(socket) {
		socket.on('data', function(data){
			//console.log("[slaveChecker] Receive ping : " +  data);

			socket.write(constant.SERVER.MASTER); //ping-pong
		});
	}).listen(constant.SERVER.INNERPORT);

	server.on('connection', function(socket) {
		console.log("[slaveChecker] connected : " + socket.remoteAddress);

		queue.push(socket);
		sendInitResource(socket);
	});

})();

process.on('message', function(m) {
	for(var i in queue) {
		queue[i].write(JSON.stringify(m, null, 2));
	}

	resourceBuffer[m.ip] = m; //for sendIntiResource
});


function sendInitResource(socket) {
	for(var key in resourceBuffer) {
		var obj = { "ip" : key, "cpu" : resourceBuffer[key].cpu, "mem" : resourceBuffer[key].mem };

		socket.write(JSON.stringify(obj, null, 2)); //for sync with slave(masterchecker.js on('data'));
		socket.write("|");
	}
}
