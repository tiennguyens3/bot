var http= require('http');
var counter= 0;

var server= http.createServer(function(req,res) {
  counter++;
  res.write('Ihavebeenaccessed' + counter + ' times.');
  res.end();
}).listen(8888);