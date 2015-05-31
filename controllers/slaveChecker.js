var net = require('net');
var constant = require("../configs/constants.json");

(function() {
	var server = net.createServer(function(socket) {
		console.log('Slave Listener is listening at port %s', constant.SERVER.INNERPORT);
		
		socket.on('data', function(data){
			console.log("Receive ping : " +  data);
			soc.write("master"); 
			console.log("Send ping : I'm a master");	
		});
		
	}).listen(constant.SERVER.INNERPORT);
})();


