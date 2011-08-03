function init() {
  comm_init();
  
  create_session(function(code) {Game.next_session_code = code});
  
  Game.start();
  keyboard_init();
  
  socket.on('player_joined', function(code) {
    Game.ships[code] = new Ship(code);
    create_session(function(code) {Game.next_session_code = code});
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
