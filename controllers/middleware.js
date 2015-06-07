var request = require("request");

exports.redirector = function(type, IP, port, url, res, callback, info) {
	request('http://' + IP + ':' + port + url , function(error, response, body) {
		if(!error && response.statusCode == 200) {

			callback(res, response, info, IP, type);
		} else {
			console.log("[redirector] Host " + IP + " has some error in response");

			callback(res, response, null, IP, type);
		}		
	});

/*
	console.log(IP + ':' + port);
	request.get('http://'+ IP + ':' + port).on('response', function(response) {
    		console.log(response.statusCode) // 200 
    		console.log(response.headers['content-type']) // 'image/png' 
  	});
*/
};