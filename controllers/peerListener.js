var net = require('net');
var constant = require("../configs/constants.json");
var queue = [];
var myResource = [];
var hosts = require('../configs/hosts.json');
var hostsize = hosts.hosts.length;
var peers = require('../configs/peers.json');
var peersize = peers.peers.length;
var IP = require("ip");


(function() {
	console.log('[peerListener] listening at port %s', constant.SERVER.INNERPORT);

	registerPeer();

	var server = net.createServer(function(socket) {
		socket.on('data', function(data){
			console.log("[peerListener] Receive S.O.S from " + this.remoteAddress);

			try {
				data = JSON.parse(data);
				var isAvailable = false;

				if(data.type === constant.SERVER.SOS) { //response to S.O.S
					for(var key in myResource) { //first-come, first-served
						if(myResource[key].CPU > data.CPU && myResource[key].MEM > data.MEM) {
							socket.write(constant.SERVER.AVAILABLE);
							isAvailable = true;

							break;
						}
					}

					if(isAvailable === false) {
						socket.write(constant.SERVER.NOT_AVAILABLE);
					}
				}
			} catch(e) {
				console.log("[peerListener] Json parsing error");
			}
		});
	}).listen(constant.SERVER.INNERPORT);

	server.on('connection', function(socket) {
		console.log("[peerListener] a peer is connected : " + socket.remoteAddress);

		//queue.push(socket);
	});
})();

function registerPeer() {
	for(var i=0; i<peersize ; ++i) {
		queue[peers.peers[i].IP] = peers.peers[i].innerport;
	}
}

//broadcast S.O.S to other load balancers
process.on('message', function(m) { //param1 1) {"type" : string(RESOURCE), "CPU" : integer, "MEM" : integer} 
	try {
		m = JSON.parse(m);	
		if(m.type === constant.SERVER.SOS) {
			for(var key in queue)	{	
				if(IP.address() != key && queue[key] !== undefined) { //except itself
					var client = net.connect(queue[key], key, function(data) { //'connect' listener
						console.log('[peerChecker] send S.O.S to ' + this.remoteAddress);
						
						this.write(JSON.stringify(m, null, 2));

						this.on('data', function(data) {  //got response from other peer
							data = data.toString();
		
							if(data === constant.SERVER.AVAILABLE) {
								choosePeer(this.remoteAddress);
							} else if(data === constant.SERVER.NOT_AVAILABLE){
								//wait other peer
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
		} else if(m.IP !== undefined && m.CPU !== undefined && m.MEM !== undefined) {
				myResource[m.IP] = {"CPU" : m.CPU, "MEM" : m.MEM};			
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