///// Settings ///////////////////////////////////////
var version = '0.1.2'
var port = 9888;
var log_level = 'info';  // error, warn, info, debug
var logfile_name = 'phii-server.log'
//////////////////////////////////////////////////////

var fs = require('fs')
var logfile = fs.openSync(logfile_name, 'a') 

fs.write(logfile, 'Server v' + version + ' started at ' + Date() + '\n', null, 'utf8')

// io.listen() will create a http server
var Io = require('socket.io').listen(9888);
// get logger instance from Io and set log level
var logger = Io.settings.logger;
logger.info('setting log level to', log_level);
logger.level = {error:0, warn:1, info:2, debug:3}[log_level];
Io.configure(function () {
  Io.set('log level', {error:0, warn:1, info:2, debug:3}[log_level]);
});

var sessions = {};

function getCode() {
  var c = '', digits = '0123456789';
  for (var i=0; i<4; i++) c += digits[Math.floor(digits.length*Math.random())];
  return c;
}

/// Events:
/// - create_session(callback) - Game=>Server
/// - join_session(session_code, data, callback) - Player=>Server
/// - data(session_code, data) - Game=>Player or Player=>Game
/// - player_joined(session_code, data) - Server=>Game
/// - player_left(session_code) - Server=>Game
/// - session_closed(session_code) - Server=>Player

Io.sockets.on('connection', function (socket) {
  /// Called by Game to create a communication channel between the Game and one Player.
  /// Parameters:
  /// - fn: a callback function, session code and success flag are passed back
  socket.on('create_session', function(fn) {
    if (typeof fn !== 'function') return;
    var code = getCode();
    sessions[code] = {game: socket.id};
    fn(code, true);
    logger.info('[', socket.id, '] created session ', code, '.');
    fs.write(logfile, '['+Date()+'] Session created.\n', null, 'utf8')
  });
  
  /// Called by Player to join the session a Game set up. On success, the Game
  /// that owns the session is notified with a 'player_joined' event.
  /// Parameters:
  /// - code: session code, a string!
  /// - data: this is passed to the Game and can be used to submit, e.g., the Player's name
  /// - fn: callback function, session code and success flag are passed back.
  socket.on('join_session', function(code, data, fn) {
    if ((typeof code !== 'string') || (typeof data === 'undefined') ||
        (typeof fn !== 'function')) return;
    if (!code || !sessions[code] || sessions[code].player) return;
    sessions[code].player = socket.id;
    fn(code, true);
    Io.sockets.socket(sessions[code].game).emit('player_joined', code, data);
    logger.info('[', socket.id, '] joined session ', code, '.');
    var pname = ('player_name' in data) ? data.player_name : '?'
    fs.write(logfile, '['+Date()+'] Player ' + pname + ' joined.\n', null, 'utf8')
  });
  
  /// Called by either Game or Player. If the other participant of the session has
  /// joined, the data is sent to him, otherwise it is discarded.
  /// Parameters:
  /// - code: session code, a string!
  /// - data: this is passed to the other participant of the session
  socket.on('data', function(code, data) {
    if ((typeof code !== 'string') || (typeof data === 'undefined')) return;
    if (!code || !sessions[code]) return;
    var s = sessions[code];
    if (!s.player || !s.game) return;
    if (socket.id == s.game) {
      Io.sockets.socket(s.player).emit('data', code, data);
      logger.debug('[', s.game, '] sent message to ', s.player, '.');
    } else if (socket.id == s.player) {
      Io.sockets.socket(s.game).emit('data', code, data);
      logger.debug('[', s.player, '] sent message to ', s.game, '.');
    }
  });
  
  /// When a Game disconnects, all its sessions are closed and the participating
  /// Players are notified. When a Player disconnects, for each of its sessions,
  /// the corresponding Game is notified.
  socket.on('disconnect', function () {
    for (code in sessions) {
      if (!sessions.hasOwnProperty(code)) continue;
      var s = sessions[code];
      if (s.player == socket.id) {
        s.player = null;
        if (s.game) Io.sockets.socket(s.game).emit('player_left', code);
        else delete sessions[code];
      } else if (s.game == socket.id) {
        if (s.player) Io.sockets.socket(s.player).emit('session_closed', code);
        delete sessions[code];
      }
    }
  });
});

