var request = require("request");

exports.redirector = function(IP, port, url, res, callback, info) {
	console.log(url);
	request('http://' + IP + ':' + port + url , function(error, response, body) {
		if(!error && response.statusCode == 200) {
			
			callback(res, response, info);
		} else {
			console.log("[redirector] Host " + IP + " has some error in response");

			callback(res, response);
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