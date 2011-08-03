var ShipExplosion = function(x,y){
    this.time = 20;
    this.x = x;
    this.y = y;
    this.step = function(){
        for (var i=0; i< 2; ++i){ 
            var r = this.time - 10;
            if (r < 0) r = -r;
            Game.explosions.push(new Explosion(this.x+20+8*r*(Math.random()-0.5),this.y+20+8*r*(Math.random()-0.5)));
        }
        this.time--;
    }
}

var Game = {
   w: 800, h: 500
   , info_bar_h: 30
   , grav_x:0, grav_y:0
   , air_friction: 0.01
   ,step_timer: null
   ,ships: {}
   ,deadShips: {}
   ,shots: []
   ,explosions:[]
   ,smokes: []
   ,shipExplosions: []
   ,next_session_code: null
   ,start: function() {
    this.canvas = document.getElementById("canvas");
     this.canvas.width = this.w; 
     this.canvas.height = this.h + this.info_bar_h;
     this.painter = new PaintEngine(this.canvas.getContext("2d"));
     this.step_timer = setInterval(this.step, 30);
   }
  /// move the shots and erase marked ones (which hit something / flew too far)
  ,handleShots: function() {
    var keep = [];
    for (var i=0; i<Game.shots.length; i++) {
      Game.shots[i].step();
      if (!Game.shots[i].erase) keep.push(Game.shots[i]);
    }
    Game.shots = keep;
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

    ,handleShips : function(){
        // kill dead ships 
        for(var s in Game.ships){
            var ship = Game.ships[s];
            if (ship.energy <= 0) {
                Game.shipExplosions.push(new ShipExplosion(ship.x,ship.y));
                delete Game.ships[ship.session_code]; 
                ship.deathTime = Date.now();
                Game.deadShips[ship.session_code]=ship; 
            }
        }
        var now = Date.now();        
        for(var s in Game.deadShips){
            var ship = Game.deadShips[s];
            if( (now - ship.deathTime) > 3000){
                delete Game.deadShips[ship.session_code];
                Game.ships[ship.session_code] = ship;
                ship.spawn();
            }
        }
    }
   
   ,collisionDetection: function() {
      // shot - ship collisions
      for (var s in Game.ships) for (var x in Game.shots) {
        Physics.checkCollision(Game.ships[s], Game.shots[x],
          function(ship, shot, px, py) {
            Game.explosions.push(new Explosion(shot.x, shot.y));
            shot.erase = true;
            ship.energy -= shot.energy;
            Physics.letCollide(ship, shot);
        });
      }
      
      // ship - world collisions
      for(var s in Game.ships){
        var ship = Game.ships[s];
        if (ship.x+ship.vx  >= Game.w-ship.collision_radius || ship.x+ship.vx <= 0+ship.collision_radius) {
          ship.energy -= Math.max(10, ship.vx*ship.vx*0.5*ship.mass * 0.6);
          ship.vx = -ship.vx * 0.4;
        } 
        if (ship.y+ship.vy >= Game.h-ship.collision_radius || ship.y+ship.vy <= 0+ship.collision_radius) {
          ship.energy -= Math.max(10, ship.vy*ship.vy*0.5*ship.mass * 0.6);
          ship.vy = -ship.vy * 0.4;
        }
      }
        
      // ship - ship collisions
      for (var s1 in Game.ships) for (var s2 in Game.ships) {
        if (s1>s2) Physics.checkCollision(Game.ships[s1], Game.ships[s2],
          function(ship1, ship2, px, py) {
            var energy = Math.max(Physics.letCollide(ship1, ship2), 10);
            ship1.energy -= energy;
            ship2.energy -= energy;
            Game.explosions.push(new Explosion(px, py));
        });
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
        
        var newShipExplosions = [];
        for(var e in Game.shipExplosions){
            Game.shipExplosions[e].step();
            if(Game.shipExplosions[e].time > 0){
                newShipExplosions.push(Game.shipExplosions[e]);
            }
        }
        Game.shipExplosions = newShipExplosions;   

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

    // kill dead vessels
    Game.handleShips();
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
