function init() {
  comm_init();
  
  create_session();
  
  Game.start();
  keyboard_init();
  
  socket.on('player_joined', function(code) {
    Game.ships[code] = new Ship(code);
  });
  
  socket.on('data', function(code, data) {
          //  console.log(code);
          if (code in Game.ships) {
              //         console.log('steering ship with given data');
              Game.ships[code].steer(data);
          }
  });

}
