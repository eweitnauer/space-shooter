///// Settings ////////////////////////////////
var port = 9888;
var logging = false;
///////////////////////////////////////////////

// note, io.listen() will create a http server for you
var Io = require('socket.io').listen(9888);
var Uuid = require('node-uuid');

var sessions = {};

function getCode() {
  var c = '', digits = '0123456789';
  for (var i=0; i<4; i++) c += digits[Math.floor(digits.length*Math.random())];
  return c;
}

Io.sockets.on('connection', function (socket) {
  socket.on('create_session', function(fn) {
    var code = getCode(); //Uuid().substring(0,4);
    sessions[code] = {game: socket.id};
    if (typeof fn === 'function') fn(code, true);
    else socket.emit('session_created', code, true);
    if (logging) console.log('[' + socket.id + '] created session ' + code + '.');
  });
  
  socket.on('join_session', function(code, fn) {
    //if (!code || !sessions[code] || sessions[code].player) return;
    if (!code || !sessions[code]) return;
    sessions[code].player = socket.id;
    if (typeof fn === 'function') fn(code, true)
    else socket.emit('session_joined', code, true);
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
    if (logging) console.log('client disconnected');
    for (code in sessions) {
      if (!sessions.hasOwnProperty(code)) continue;
      var s = sessions[code];
      if (s.player == socket.id) {
        s.player = null;
        if (s.game) Io.sockets.socket(s.game).emit('player_left', code);
        else delete sessions[code];
      } else if (session.game == socket.id) {
        if (s.player) Io.sockets.socket(s.player).emit('session_closed', code);
        delete sessions[code];
      }
    }
  });
});

