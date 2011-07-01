///// Settings ////////////////////////////////
var node_server_url = 'localhost';
var port = 9888;
///////////////////////////////////////////////

var io = require('socket.io-node-client/io-client').io;

var socket = new io.Socket(node_server_url, {port: port});

var send = function() {
  socket.send('hi');
}

socket.on('connect', function() {
  console.log('I connected!');
  setInterval(send, 1000);
});

socket.on('message', function(msg) {
  console.log('Got a message: ' + JSON.stringify(msg));
});

socket.on('disconnect', function() {
  console.log('My connection broke!');
});

socket.connect();

