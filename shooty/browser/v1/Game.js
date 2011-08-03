var Game = {
   w: 640, h: 500
   , grav_x:0, grav_y:9.81/5000
   , air_friction: 0.01
  ,step_timer: null
  ,ships: {}
   ,shots: []
   ,explosions:[]
   ,smokes: []
  ,start: function() {
    this.canvas = document.getElementById("canvas");
    this.canvas.width = this.w; 
    this.canvas.height = this.h;
    this.painter = new PaintEngine(this.canvas.getContext("2d"));
    this.step_timer = setInterval(this.step, 30);
  }
  ,handleShots: function() {
    var newShots = [];
    for (s in Game.shots) {
        Game.shots[s].step();
        if(!Game.shots[s].isAtEnd()){
            newShots.push(Game.shots[s]);
        }
    }
    Game.shots = newShots;
  }
  ,handleSmokes : function(){
        var newSmokes = [];
        for(var s in Game.smokes){
            Game.smokes[s].step();
            if(!Game.smokes[s].isAtEnd()){
                newSmokes.push(Game.smokes[s]);
            }
        }
        Game.smokes = newSmokes;
  }
   ,collisionDetection: function() {
        // shot - ship collisions
        for(s in Game.ships){
            var ship = Game.ships[s];
            for(x in Game.shots){
                var shot = Game.shots[x];
                if(ship.isHit(shot)){
                    shot.hit = true;
                    Game.explosions.push(new Explosion(shot));
                    ship.hit(shot);
                }
            }
        }
        
        // ship - world collisions
        for(s in Game.ships){
            var ship = Game.ships[s];
            if (ship.x+ship.vx  >= Game.w-ship.collision_radius || ship.x+ship.vx <= 0+ship.collision_radius) {
                ship.vx = -ship.vx*0.8;
            } 
	    if (ship.y+ship.vy >= Game.h-ship.collision_radius || ship.y+ship.vy <= 0+ship.collision_radius) {
                ship.vy = -ship.vy*0.8;
            }
        }
        
        // ship - ship collisions
        for(s in Game.ships){
            var ship = Game.ships[s];
            for(os in Game.ships){
                var othership = Game.ships[os];
                if((s > os) &&  ship.collidesWith(othership)){
                    ship.collision(othership);	
                }
            }
        }
    }
   ,handleExplosions: function(){
        var newExplosions = [];
        for(var e in Game.explosions){
            Game.explosions[e].step();
            if(!Game.explosions[e].isAtEnd()){
                newExplosions.push(Game.explosions[e]);
            }
        }
        Game.explosions = newExplosions;     
    }
   ,stepShips: function(){
        for (var s in Game.ships){
            var ship = Game.ships[s];
            ship.step(); 
            if(ship.steer_data && ship.steer_data.accel){
                var x = ship.x;
                var y = ship.y;
                var r = ship.rot + 1.1;
                Game.smokes.push(new Smoke(x+Math.cos(r)*30,y+Math.sin(r)*30));
                r += 0.8;
                Game.smokes.push(new Smoke(x+Math.cos(r)*30,y+Math.sin(r)*30));
            }
        }
    }
  ,step: function() {
    // move the ships
    Game.stepShips();
    // handle the shots
    Game.handleShots();
    // collision dectection
    Game.collisionDetection();
    // add explosions
    Game.handleExplosions();
    // step and delete smoke clouds
    Game.handleSmokes();
    // update the display
    Game.painter.paint();
  }
   ,shipcolors: ['rgba(255,0,0,0.7)','rgba(0,255,0,0.7)','rgba(0,0,255,0.7)','rgba(0,0,0,0.7)']
   ,nextshipcolor : 0
};
