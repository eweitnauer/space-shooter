///// Settings ////////////////////////////////
var port = 9888;
var logging = true;
///////////////////////////////////////////////

// note, io.listen() will create a http server for you
var Io = require('socket.io').listen(9888);
var Uuid = require('node-uuid');

var sessions = {};

Io.sockets.on('connection', function (socket) {
  socket.on('create_session', function() {
    var code = Uuid().substring(0,4);
    sessions[code] = {game: socket.id};
    socket.emit('session_created', code, true);
    if (logging) console.log('[' + socket.id + '] created session ' + code + '.');
  });
  
  socket.on('create_session_cool', function(fn) {
    var code = Uuid().substring(0,4);
    sessions[code] = {game: socket.id};
    fn(code, true);
    if (logging) console.log('[' + socket.id + '] created session ' + code + '.');
  });
  
  socket.on('join_session', function(code) {
    if (!code || !sessions[code] || sessions[code].player) return;
    sessions[code].player = socket.id;
    socket.emit('session_joined', code, true);
    Io.sockets.socket(sessions[code].game).emit('player_joined', code);
    if (logging) console.log('[' + socket.id + '] joined session ' + code + '.');
  });
  
  socket.on('data', function(code, data) {
    if (!code || !sessions[code]) return;
    var s = sessions[code];
    if (!s.player || !s.game) return;
    if (socket.id == s.game) {
      Io.sockets.socket(s.player).emit('data', code, data);
      if (logging) console.log('[' + s.game + '] sent message to ' + s.player + '.');
    } else if (socket.id == s.player) {
      Io.sockets.socket(s.game).emit('data', code, data);
      if (logging) console.log('[' + s.player + '] sent message to ' + s.game + '.');
    }
  });
  
  socket.on('disconnect', function () {
    Io.sockets.emit('user disconnected');
  });
});

