var socket;

function init() {
  socket = io.connect('http://localhost:9888');
  socket.on('data', function(code, data) {
    console.log('Received data from session ' + code + ': ' + data);
  });
  socket.on('session_created', function(code, success) {
    console.log('Created Session: ', code, success);
  });
  socket.on('session_joined', function(code, success) {
    console.log('Joined Session: ', code, success);
  });
  socket.on('player_joined', function(code) {
    console.log('Player Joined Session: ', code);
  });

}
