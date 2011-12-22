/// Written by Erik Weitnauer, Christof Elbrechter and Rene Tuennermann.
/// eweitnauer@gmail.com

function addship() {
  if ('key' in Game.ships) var code = ''+Math.random()*1000;
  else code = 'key';
  Game.ships[code] = new Ship(code); 
  Game.ships[code].spawn();
}

function touch_interface() {
  var can = document.getElementById('canvas');
  var fn = function(event) {
    event.preventDefault();
    var steer_data = {accel:false, shot:false};
    for (var i=0; i<event.targetTouches.length; ++i) {
      var touch = event.targetTouches[i];
      if (touch.pageX < 512) steer_data.accel = true;
      else steer_data.shot = true;
    }
    if ('key' in Game.ships) {
      Game.ships['key'].steer(steer_data);
    }
  }
  can.addEventListener('touchmove', fn, false);
  can.addEventListener('touchstart', fn, false);
  can.addEventListener('touchend', fn, false);
}

function acc_interface() {
  document.addEventListener('acceleration',function(e) {
    var pitch = Math.atan2(e.accelY,-e.accelX) * 180/Math.PI;
    if ('key' in Game.ships) {
      Game.ships['key'].steer({pitch:1.5*pitch, mode:'relative'});
    }
  },false);
}

var comm;

function init() {
  enyo.setFullScreen(true)
  enyo.setAllowedOrientation('right')  

  Game.start();
  touch_interface();
  acc_interface();
  addship();

  try {
    comm = new Communicator(io);
    registerListeners();
    comm.connect();
    comm.create_session();
  } finally {}
}

function registerListeners() {
  comm.on('connect', function() {
    comm.connected = true;
  });
  comm.on('player_joined', function(code, data) {
    console.log("player joined")
    Game.ships[code] = new Ship(code);
    Game.ships[code].spawn();
    if ((typeof data === 'object') && data.player_name) {
      Game.ships[code].player_name = data.player_name;
    }
    comm.create_session();
  });
  comm.on('player_left', function(code) {
    if (!(code in Game.ships)) return;
    Game.ships[code].animation.finished = true;
    delete Game.ships[code];
  });
  comm.on('data', function(code, data) {
    if (!(code in Game.ships)) return;
    var steer_data = { pitch: data.pitch || 0, shot: data.btn2 && data.btn2.hold, 
                       accel: data.btn1 && data.btn1.hold, mode: data.mode };
    Game.ships[code].steer(steer_data);
  });
}

var last_vibrate={};
function sendVibrate(session_code, duration) {
  if (!comm.connected) return;
  if (typeof(duration) != 'number') duration = 200;
  var now = Date.now();
  if (last_vibrate[session_code] && (now-last_vibrate[session_code]<200)) return;
  if(comm){
    comm.send_data(session_code, {vibrate: duration});
  }
  last_vibrate[session_code] = now;
}
