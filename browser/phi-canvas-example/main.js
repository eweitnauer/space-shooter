function init() {
  comm_init();
  create_session();
  game_init();
  
  socket.on('player_joined', function(code) {
    if (!bar_B.player) { bar_B.player = code; create_session(); }
    else if (!bar_A.player) bar_A.player = code;
    else log('no more free player slots');
  });
  
  socket.on('data', function(code, data) {
    if (data && data.pitch) {
      if (code == bar_B.player) input_B(data.pitch);
      if (code == bar_A.player) input_A(data.pitch);
    }
  });
}
