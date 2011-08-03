var Game = {
   w: 640, h: 500
   , grav_x:0, grav_y:9.81/5000
   , air_friction: 0.01
  ,step_timer: null
  ,ships: {}
   ,shots: []
   ,explosions:[]
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
  ,step: function() {
    // move the ships
    for (s in Game.ships) Game.ships[s].step();    
    // handle the shots
    Game.handleShots();
    // collision dectection
    Game.collisionDetection();
    // add explosions
    var newExplosions = [];
    for(e in Game.explosions){
        Game.explosions[e].step();
        if(!Game.explosions[e].isAtEnd()){
            newExplosions.push(Game.explosions[e]);
        }
    }
    Game.explosions = newExplosions;
    // update the display
    Game.painter.paint();
  }
   ,shipcolors: ['rgba(255,0,0,0.7)','rgba(0,255,0,0.7)','rgba(0,0,255,0.7)','rgba(0,0,0,0.7)']
   ,nextshipcolor : 0
};

var Explosion = function(shot_or_ship){
    var self = this;
    this.x = shot_or_ship.x;
    this.y = shot_or_ship.y;
    this.time = -1;
    this.isAtEnd = function(){
        return this.time >= 4;
    }
    this.step = function(){
        this.time++;
    }
};

var Shot = function(id,x,y,v,rot,maxDist){
    var self = this;
    this.id = id;
    this.initx = x;
    this.inity = y;
    this.x = x;
    this.y = y;
    this.v = v;
    this.hit = false;
    this.rot = rot;
    this.maxDist2 = maxDist*maxDist;
    this.step = function(){
        this.x += v * Math.sin(this.rot);
        this.y += v * -Math.cos(this.rot);
    }
    this.isAtEnd = function(){
        if(this.hit) return true;
        var dx = this.x-this.initX;
        var dy = this.y-this.initY;
        return dx*dx+dy*dy > this.maxDist2;
    }
};


var Ship = function(session_code) {
  var self = this;
  this.id = Ship.id++;
  this.x = 320;
  this.y = 250;
  this.rot = 0;
  this.vx = 0;
  this.vy = 0;
  this.collision_radius = 10;
  //this.accel = 0;
  this.energy = 100;
  this.session_code = session_code;
  this.color = Game.shipcolors[Game.nextshipcolor++];
  Game.nextshipcolor = Game.nextshipcolor % 4;

  this.hit = function(shot){
      this.energy--;
      var vx = Math.sin(shot.rot)*shot.v;
      var vy = -Math.cos(shot.rot)*shot.v;
      this.vx += 0.05*vx;
      this.vy += 0.05*vy;
  }

  this.isHit = function(shot){
      //      console.log('isHit: x:' +thisx + ' y:' + y + ' shot.x:' + shot.x + ' shot.y:'+shot.y);
      var dx = this.x-shot.x;
      var dy = this.y-shot.y;
      return Math.sqrt(dx*dx+dy*dy) < this.collision_radius;
  }

  this.collidesWith = function(ship){
      var dx = this.x-ship.x;
      var dy = this.y-ship.y;
      return Math.sqrt(dx*dx+dy*dy) < this.collision_radius+ship.collision_radius;
  }

  this.collision = function(ship){
      this.energy--;
      Game.explosions.push(new Explosion(ship));
      //var vx = Math.sin(shot.rot)*shot.v;
      //var vy = -Math.cos(shot.rot)*shot.v;
      //this.vx += 0.05*vx;
      //this.vy += 0.05*vy;
  }


  this.steer = function(data) {
    this.steer_data = data;
  }

  this.hasAccel = function() {
      return this.steer_data && this.steer_data.accel;
  }
  this.isShooting = function() {
      return this.steer_data && this.steer_data.shot;
  }
  
  this.step = function() {
      if (this.steer_data){
          if(this.steer_data.pitch){
              this.rot -= this.steer_data.pitch/600;
          }
          if(this.steer_data.accel){
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              this.vx += dx * this.steer_data.accel;
              this.vy += dy * this.steer_data.accel;
          }
          if(this.steer_data.shot){
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              Game.shots.push(new Shot(this.id,this.x+dx*10, this.y+dy*10, 10, this.rot, 500));
          }
      }
      this.vx += Game.grav_x;
      this.vy += Game.grav_y;

      this.vx *= 1.0-Game.air_friction;
      this.vy *= 1.0-Game.air_friction;
      this.x += this.vx;
      this.y += this.vy;
  }
};
Ship.id = 0;


