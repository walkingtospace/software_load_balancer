var constant = require('../configs/constants.json');
var hosts = require('../configs/slaves.json');
var hostsize = hosts.slaves.length;
var hasLB = true;
var hostcount = 0;
var host;
var middleware = require('../controllers/middleware');
var express = require('express');
var app = express();

// If there are no Meercats in slaves.json, use end-hosts
if (hostsize == 0){
  hasLB = false;
  hosts = require('../configs/hosts.json');
  hostsize = hosts.hosts.length;
}
  
//Forward any URL by roundrobin
app.get('/*', roundrobin);

function roundrobin(req, res, next) {
  if(hostcount >= (hostsize-1))
    hostcount = 0;
  else
    hostcount++;

  //redirect requests to host
  var reqURL = req.url;
  if(hasLB)
    host = hosts.slaves[hostcount];
  else
    host = hosts.hosts[hostcount];
  console.log("[roundrobin] Redirect traffic to : " + host.IP + " port:" + host.port); 
  middleware.redirector(null, host.IP, host.port, reqURL, res, send);
}

function send(res, resFromHost, info, type) {
  if(resFromHost === undefined) {
    res.status(200).send("Got error from host " + host.IP + " port:" + host.port);

  } else {
      var header = "Successfully received response </br>";
      var address = "IP: "+ host.IP + " PORT: " + host.port + "</br>"; 
      var resStatus = "RESPONSE CODE: " + resFromHost.statusCode + "</br>";

      res.status(200).send(header + address+ resStatus);
  }
}

var server = app.listen(constant.SERVER.PORT, function () {
    var port = server.address().port;

  console.log('Hostagent is listening at port %s', port);
});
