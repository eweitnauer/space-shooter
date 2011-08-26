var key_steer_data = { pitch: 0, accel: 0 };

var keyboard_init = function(){
    Game.ships['key'] = new Ship('key');
    Game.ships['key'].spawn();
    
    document.onkeydown = function(evt) {

        if(evt.keyCode == 37){
            key_steer_data.pitch = 50;
        }else if(evt.keyCode == 39){
            key_steer_data.pitch = -50;
        }else if(evt.keyCode == 38){ // up-arrow
            key_steer_data.accel = true;
        }else if(evt.keyCode == 65){
            key_steer_data.shot = true;
        }
        if ('key' in Game.ships) Game.ships['key'].steer(key_steer_data);
        
        if(evt.keyCode == 78){ // 'n'
            var code = ''+Math.random()*1000;
            Game.ships[code] = new Ship(code); 
            Game.ships[code].spawn();
        }
    };
    
    document.onkeyup = function(evt) {
        if(evt.keyCode == 37 || evt.keyCode == 39){
            key_steer_data.pitch = 0;
        }else if(evt.keyCode == 38){ // up-arrow
            key_steer_data.accel = false;
        }else if(evt.keyCode == 65){
            key_steer_data.shot = false;
        }
        if ('key' in Game.ships) Game.ships['key'].steer(key_steer_data);
    };

}

