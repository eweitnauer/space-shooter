var Ship = function(session_code) {
  var self = this;
  this.code = session_code;
  this.id = Ship.id++;
  this.x = 320;
  this.y = 250;
  this.rot = 0;
  this.vx = 0;
  this.vy = 0;
  this.collision_radius = 12;
  this.mass = 1;
  //this.accel = 0;
  this.energy = 100;
  this.steps_to_shot = 0;
  this.shot_delay = 6;
  this.session_code = session_code;
  this.color = ShipColors[Game.nextshipcolor];
  Game.nextshipcolor = (Game.nextshipcolor+1) % ShipColors.length;
  this.steer_data = { shot:false, accel:false, pitch:0 };

  this.spawn = function(){
      this.energy = 100;
      this.x = this.collision_radius + Math.random()*(Game.w-2*this.collision_radius);
      this.y = this.collision_radius + Math.random()*(Game.h-2*this.collision_radius);
      this.vx = this.vy = 0;
  }
  
  this.steer = function(data){
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
              this.vx += dx * 0.2 * (this.steer_data.accel ? 1 : 0);
              this.vy += dy * 0.2 * (this.steer_data.accel ? 1 : 0);
          }
          if(this.steer_data.shot) {
            this.steps_to_shot -= 1;
            if (this.steps_to_shot <= 0) {
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              Game.shots.push(new Shot(this,this.x+dx*10, this.y+dy*10, 10, this.rot, 250));
              this.steps_to_shot = this.shot_delay;
            }
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
