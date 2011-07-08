var socket, session_code;

function log() {
  var msg = [];
  for (i in arguments) msg.push(arguments[i]);
  msg = msg.join(' ');
  console.log(msg);
  var p = document.getElementById('log_text');
  p.appendChild(document.createElement('br'));
  p.appendChild(document.createTextNode(msg));
};

function init() {
  socket = io.connect('http://localhost:9888');
  document.getElementById('p-init').innerHTML = socket ? 'ok' : 'fail';
  socket.on('session_joined', function(code, success) {
    log('joined session ' + code + ', ' + success);
    session_code = code;
  });
  socket.on('data', function(code, data) {
    log('received data from session ' + code + ': ' + data);
  });
  socket.on('player_joined', function(code) {
    log('player joined session', code);
  });
  socket.on('session_created', function(code, success) {
    log('Created Session: ', code, success);
  });  
}

function create_session() {
  socket.emit('create_session', function(code, success) {
    document.getElementById('p-create').innerHTML = success ? code : 'fail';
  });
}

function join_session() {
  var code = document.getElementById('session_code').value;
  socket.emit('join_session', code);
}

function send_data() {
  var data = document.getElementById('data').value;
  socket.emit('data', session_code, data);
}
