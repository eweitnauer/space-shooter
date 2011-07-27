function init() {
    //comm_init();
  //create_session();
  Game.start();
  keyboard_init();
  /*
  socket.on('player_joined', function(code) {
    Game.ships[code] = new Ship(code);
  });
  
  socket.on('data', function(code, data) {
    if (code in Game.ships) Game.ships[code].steer(data);
  });
          */
}
