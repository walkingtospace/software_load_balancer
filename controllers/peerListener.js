var net = require('net');
var constant = require("../configs/constants.json");
var queue = [];
var myResource = {};
var peerResource = {};
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var peers = require('../configs/peers.json');
var peersize = peers.peers.length;


(function() {
	console.log('[peerListener] listening at port %s', constant.SERVER.INNERPORT);

	registerPeer();

	peerResource = {"IP" : null, "CPU" : constant.HOST.INIT_CPU, "MEM" : constant.HOST.INIT_MEM}; //init

	var server = net.createServer(function(socket) {
		socket.on('data', function(data){
			console.log("[slaveChecker] Receive S.O.S from " + this.remoteAddress);

			if(data === constant.SERVER.SOS) { //response to S.O.S
				socket.write(JSON.stringify(myResource, null, 2));
			}
		});
	}).listen(constant.SERVER.INNERPORT);

	server.on('connection', function(socket) {
		console.log("[peerListener] a peer is connected : " + socket.remoteAddress);

		//queue.push(socket);
	});
})();

function registerPeer() {
	for(int i=0; i<peersize ; ++i) {
		queue[peers.peers[i].IP] = peers.peers[i].innerport;
	}
}

//broadcast S.O.S to other load balancers
process.on('message', function(m) { //param1 1) {"type" : string(RESOURCE), CPU" : integer, "MEM" : integer} 
	try {
		m = JSON.parse(m);	

		if(m.type === constant.SERVER.SOS) {
			for(var key in queue)	{
				if(queue[key].innerport !== undefined) {
					var client = net.connect(queue[key].innerport, key, function(data) { //'connect' listener
						console.log('[peerChecker] send S.O.S to' + this.remoteAddress;
						
						this.write(constant.SERVER.SOS);

						this.on('data', function(data) {  //got response from other peer
							var json = JSON.parse(data); //{"CPU" : integer, "MEM" : integer}

							if(peerResource.CPU > json.CPU && peerResource.MEM > json.MEM)  {//First-come, First-served
								peerResource = json;
								choosePeer(this.remoteAddress);

								break;
							} 
						});
					});

					client.on('end', function() {
						console.log('[peerChecker] ' + this.remoteAddress + ' disconnected');
					});

					client.on('error', function() {
						//console.log('err');
					});
				} 
			}	
		} else if(m.CPU !== undefined && m.MEM !== undefined) {
				myResource = {"CPU" : m.CPU, "MEM" : m.MEM};			
		} else {
			console.log('[peerChecker] myResource is undefined');
		}
		
	} catch(e) {
		console.log('[peerChecker] JSON parsing error');
	}
});

function choosePeer(IP) {
	process.send(IP);
}