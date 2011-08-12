/// global varibale for communication with Phi server
var socket, next_session_code = null;

/// connect to Phi server
function comm_init() {
  socket = io.connect('http://phigames.com:9888');
  
  socket.on('connect', function() {
    console.log('connected');
  });
  socket.on('disconnect', function() {
    console.log('disconnected');
  });  
  socket.on('player_joined', function(code) {
    console.log('player joined session', code);
  });
}

/// Creates a new session on the server and calls fn(code, success) after the
/// server replied.
function create_session(fn) {
  socket.emit('create_session', function(code, success) {
    if (success && fn) fn(code);
  });
}
