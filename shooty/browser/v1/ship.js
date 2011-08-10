var Ship = function(session_code) {
  this.init_sprite();
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
  this.steer_data = { shot:false, accel:false, pitch:0 };

  this.spawn = function(){
      this.energy = 100;
      this.x = this.collision_radius + Math.random()*(Game.w-2*this.collision_radius);
      this.y = this.collision_radius + Math.random()*(Game.h-2*this.collision_radius);
      this.rot = Math.random()*2*Math.PI;
      this.vx = this.vy = 0;
  }
  
  this.steer = function(data){
      this.steer_data = data;
  }

  this.hasAccel = function() {
      return this.steer_data && this.steer_data.accel;
  }
  
  this.turnsLeft = function() {
    return this.steer_data && this.steer_data.pitch < -5;
  }

  this.turnsRight = function() {
    return this.steer_data && this.steer_data.pitch > 5;
  }
  
  this.isShooting = function() {
    return this.steer_data && this.steer_data.shot;
  }
  
  this.step = function() {
      this.steps_to_shot -= 1;
      if (this.steer_data){
          if(this.steer_data.pitch){
              this.rot -= this.steer_data.pitch/1000;
          }
          if(this.steer_data.accel){
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              this.vx += dx * 0.1 * (this.steer_data.accel ? 1 : 0);
              this.vy += dy * 0.1 * (this.steer_data.accel ? 1 : 0);
          }
          if(this.steer_data.shot) {
            if (this.steps_to_shot <= 0) {
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              Game.shots.push(new Shot(this,this.x+dx*10+this.vx, this.y+dy*10+this.vy, 10, this.rot, 250));
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
Ship.colors = ['red', 'blue', 'cyan', 'green', 'orange', 'violett'];
Ship.next_color = 0;
Ship.getNextColor = function() {
  var result = Ship.colors[Ship.next_color++];
  if (Ship.next_color >= Ship.colors.length) Ship.next_color = 0;
  return result;
}

Ship.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite([], Ship.getNextColor()));
  Game.main_sprite.child_sprites.push(this);
  var ship = this;
  // energy bar
  var energy_sprite = new Sprite([], '');
  energy_sprite.extra_draw = function(ctx) {
    ctx.fillStyle = 'rgba(0,255,0,0.5)';
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    var w = 30*ship.energy*0.01;
    ctx.fillRect(-15,19,w,4);
    ctx.strokeRect(-15,19,30,4);
  }
  this.child_sprites.push(energy_sprite);
  // the two engine flames
  var flame_sprite1 = new Sprite([100,100,100], 'flame');
  flame_sprite1.x = -11; flame_sprite1.y = 20;
  flame_sprite1.display = function() { return ship.hasAccel() || ship.turnsLeft() };
  this.child_sprites.push(flame_sprite1);
  var flame_sprite2 = new Sprite([100,100,100], 'flame');
  flame_sprite2.display = function() { return ship.hasAccel() || ship.turnsRight() }  
  flame_sprite2.x = 11; flame_sprite2.y = 20;
  this.child_sprites.push(flame_sprite2);
  // canon fire
  var canon_sprite = new Sprite([50,50,50], 'canon');
  canon_sprite.display = function() { return ship.isShooting() }  
  canon_sprite.x = 0; canon_sprite.y = -20;
  this.child_sprites.push(canon_sprite);
}
