var request = require("request");

exports.redirector = function(IP, port, res, callback, info) {
	
	request('http://' + IP + ':' + port , function(error, response, body) {
		if(!error && response.statusCode == 200) {
			
			callback(res, response, info);
		} else {
			console.log("[redirector] A host has some error in response");
			
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
