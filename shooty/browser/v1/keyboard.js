var key_steer_data = { pitch: 0, accel: 0 };

var keyboard_init = function(){
    Game.ships['key'] = new Ship('key');
    
    document.onkeydown = function(evt) {

        if(evt.keyCode == 37){
            key_steer_data.pitch = 70;
        }else if(evt.keyCode == 39){
            key_steer_data.pitch = -70;
        }else if(evt.keyCode == 38){ // up-arrow
            key_steer_data.accel = 0.2;
        }else if(evt.keyCode == 65){
            key_steer_data.shot = true;
        }
        Game.ships['key'].steer(key_steer_data);
        
        if(evt.keyCode == 78){ // 'n'
            var code = ''+Math.random()*1000;
            Game.ships[code] = new Ship(code); 
        }
    };
    
    document.onkeyup = function(evt) {
        if(evt.keyCode == 37 || evt.keyCode == 39){
            key_steer_data.pitch = 0;
        }else if(evt.keyCode == 38){ // up-arrow
            key_steer_data.accel = 0;
        }else if(evt.keyCode == 65){
            key_steer_data.shot = false;
        }
        Game.ships['key'].steer(key_steer_data);
    };

}

