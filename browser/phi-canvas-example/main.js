function init() {
  comm_init();
  create_session();
  
  socket.on('player_joined', function() {
    game_init();
  });
  
  socket.on('data', function(code, data) {
    if (data && data.pitch) {
      input_B(data.pitch);
    }
  });
}
