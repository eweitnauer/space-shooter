var key_steer_data = { pitch: 0, accel: 0, mode: 'relative' };

var keyboard_init = function() {
  Game.ships['key'] = new Ship('key');
  Game.ships['key'].player_name = "Keyboard Klaus";
  Game.ships['key'].spawn();
  
  document.onkeydown = function(evt) {
    if(evt.keyCode == 37) {
      key_steer_data.pitch = 50;
      evt.preventDefault();
    } else if(evt.keyCode == 39) {
      key_steer_data.pitch = -50;
      evt.preventDefault();
    } else if(evt.keyCode == 38) { // up-arrow
      key_steer_data.accel = true;
      evt.preventDefault();
    } else if(evt.keyCode == 65) {
      key_steer_data.shot = true;
      evt.preventDefault();
    } else if (evt.keyCode == 40) {
      evt.preventDefault();
    } else if (evt.keyCode == 190) { // .
      Game.spawn_mines(3);
    } else if (evt.keyCode == 188) { // ,
      //Game.spawn_missiles(3);
      if(Game.splashScreen){
        Game.leaveSplashScreen();
      }else{
        Game.enterSplashScreen( new WaveInfoScreen() );
      }
      
    } else if (evt.keyCode == 80) { // p
      console.log('pause pressed!');
      if(Game.state == 'paused') Game.state = 'running';
      else if(Game.state == 'running') Game.state = 'paused';
    }
    if ('key' in Game.ships) Game.ships['key'].steer(key_steer_data);
    
    if(evt.keyCode == 78){ // 'n'
      if ('key' in Game.ships) var code = ''+Math.random()*1000;
      else code = 'key';
      Game.ships[code] = new Ship(code); 
      Game.ships[code].spawn();
      evt.preventDefault();
    }
  };
  
  document.onkeyup = function(evt) {
    if(evt.keyCode == 37 || evt.keyCode == 39) {
      key_steer_data.pitch = 0;
      evt.preventDefault();
    } else if(evt.keyCode == 38){ // up-arrow
      key_steer_data.accel = false;
      evt.preventDefault();
    } else if(evt.keyCode == 65) {
      key_steer_data.shot = false;
      evt.preventDefault();
    } else if (evt.keyCode == 40) {
      evt.preventDefault();
    } else if(evt.keyCode == 83){ // s
      if (Game.state == 'shop') Game.leaveShop();
      else if (Game.ships['key']) Game.enterShop(Game.ships['key']);
    }
    if ('key' in Game.ships) Game.ships['key'].steer(key_steer_data);
  };
}
