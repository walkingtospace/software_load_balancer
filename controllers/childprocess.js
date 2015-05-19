var net = require('net');
var client = new net.Socket();

client = net.connect(40000, '52.8.72.3', function() { //'connect' listener
	console.log('connected');
	client.write('world!\r\n');
});

client.on('data', function(data) {
	console.log(data.toString());
	client.end();
});

client.on('end', function() {
	console.log('disconnected from server');
});

