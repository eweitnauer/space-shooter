var comm;

function init() {
  try{
    comm = new Communicator(io);
    registerListeners();
    comm.connect();
    comm.create_session();
  }catch(e){}
  timer = setInterval(function() { console.log(ImageBank.getLoadedImgRatio()) }, 1);
  setTimeout(function() { clearInterval(timer)}, 100)
  //Game.start()
  //keyboard_init();
}

function registerListeners() {
  comm.on('connect', function() {
    document.body.removeChild(document.getElementById('connecting'));
  });
  comm.on('player_joined', function(code, data) {
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
  if (typeof(duration) != 'number') duration = 200;
  var now = Date.now();
  if (last_vibrate[session_code] && (now-last_vibrate[session_code]<200)) return;
  if(comm){
    comm.send_data(session_code, {vibrate: duration});
  }
  last_vibrate[session_code] = now;
}
