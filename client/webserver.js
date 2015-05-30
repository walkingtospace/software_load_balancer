var express = require('express');
var app = express();
var constant = require('../configs/constants.json');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(constant.SERVER.PORT, function () {
  var port = server.address().port;

  console.log('Example app listening at %s', port);

});