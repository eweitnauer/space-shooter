var comm;

function init() {
  comm = new Communicator(io);
  registerListeners();
  comm.connect();
  comm.create_session();
  Game.start()
  keyboard_init();
}

function registerListeners() {
  /// connection established
  comm.on_connect = function() {
    document.body.removeChild(document.getElementById('connecting'));
  }
  /// player joined a session
  comm.on_player_joined = function(code, data) {
    Game.ships[code] = new Ship(code);
    Game.ships[code].spawn();
    if ((typeof data === object) && data.player_name) {
      Game.ships[code].player_name = data.player_name;
    }
    comm.create_session();
  }
  /// player left a session
  comm.on_player_left = function(code) {
    if (!(code in Game.ships)) return;
    Game.ships[code].animation.finished = true;
    delete Game.ships[code];
  }
  /// receiving data from a player
  comm.on_data = function(code, data) {
    if (!(code in Game.ships)) return;
    var p = data.pitch;
    if (data.platform == 'android') {
      if (p < -90) p = -180 - p;
      else if (p > 90) p = 180 - p;
      if (data.roll < 0) {
        if (p < 0) p = -180 - p;
        else p = 180 - p;
      }
    } else if (data.platform == 'webos') {
      if (data.roll > 0) {
        if (p < 0) p = -180 - p;
        else p = 180 - p
      }
    }
    var steer_data = { pitch: p, shot: data.btn2.hold, 
                       accel: data.btn1.hold, mode: data.mode };
    Game.ships[code].steer(steer_data);
  }
}

var last_vibrate=0;
function sendVibrate(session_code) {
  var now = Date.now();
  if (now-last_vibrate<500) return;
  socket.emit('data', session_code, {vibrate: true});
  last_vibrate = now;
}
