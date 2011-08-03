var socket, session_code;

function log() {
//  var msg = [];
//  for (i in arguments) msg.push(arguments[i]);
//  msg = msg.join(' ');
//  console.log(msg);
//  var p = document.getElementById('log_text');
//  p.appendChild(document.createElement('br'));
//  p.appendChild(document.createTextNode(msg));
  console.log(msg);
};

function comm_init() {
  socket = io.connect('http://phigames.com:9888');
  
  socket.on('connect', function() {
    log('connected');
  });
  socket.on('disconnect', function() {
    log('disconnected');
  });  
  socket.on('player_joined', function(code) {
    log('player joined session', code);
  });
}

function create_session(fn) {
  socket.emit('create_session', function(code, success) {
    //document.getElementById('session-code').innerHTML = success ? code : 'fail';
    if (success && fn) fn(code);
  });
}
