function init() {
  comm_init();
  create_session();
  
  socket.on('player_joined', function(code) {
  });
  
  socket.on('data', function(code, data) {
  });
}
