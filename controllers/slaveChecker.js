var net = require('net');
var constant = require("../configs/constants.json");

(function() {
	var server = net.createServer(function(soc){
		console.log('Slave checking server has been created');
		socket = soc;
		soc.on('data', function(data){
			console.log("resv ping");
			soc.write("alive");
			console.log('Send ping');	
		});
	}).listen(constant.HOST.INNERPORT);
})();


