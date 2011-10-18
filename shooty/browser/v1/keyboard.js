var key_steer_data = { pitch: 0, accel: 0 };

var keyboard_init = function() {
  Game.ships['key'] = new Ship('key');
  Game.ships['key'].player_name = "Local";
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
      evt.preventDefaut();
    }
    if ('key' in Game.ships) Game.ships['key'].steer(key_steer_data);
      
    if(evt.keyCode == 78){ // 'n'
      var code = ''+Math.random()*1000;
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
      evt.preventDefaut();
    }
    if ('key' in Game.ships) Game.ships['key'].steer(key_steer_data);
  };
}
