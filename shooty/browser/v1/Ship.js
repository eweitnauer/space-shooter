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
