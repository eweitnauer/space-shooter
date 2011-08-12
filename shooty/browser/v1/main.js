function init() {
  comm_init();
  
  socket.on('connect', function() {
    document.body.removeChild(document.getElementById('connecting'));
  });
  
  create_session(function(code) {next_session_code = code});
  
  Game.start();
  
  keyboard_init();
  
  socket.on('player_joined', function(code) {
    Game.ships[code] = new Ship(code);
    Game.ships[code].spawn();
    create_session(function(code) {next_session_code = code});
  });
  
  socket.on('data', function(code, data) {
          //  console.log(code);
          if (code in Game.ships) {
              var p = data.pitch*2;
              if(p < -90) p = -90;
              if(p > 90) p = 90;

              var steer_data = { pitch: p, shot: data.btn2, 
                                 accel: data.btn1 };
              Game.ships[code].steer(steer_data);
          }
  });
}

var last_vibrate=0;
function sendVibrate(session_code) {
  var now = Date.now();
  if (now-last_vibrate<500) return;
  socket.emit('data', session_code, {vibrate: true});
  last_vibrate = now;
}
