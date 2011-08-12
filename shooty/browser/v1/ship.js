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
      this.x = Game.borders.left + this.collision_radius + Math.random()*(Game.borders.right-Game.borders.left-2*this.collision_radius);
      this.y = Game.borders.top + this.collision_radius + Math.random()*(Game.borders.bottom-Game.borders.top-2*this.collision_radius);
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
  
  this.explode = function() {
    for (var t=600; t>=0; t-=100) {
      for (var i=0; i<2; ++i) {
        var r = (10+t/20) + Math.random()*10-5;
        var a = Math.random()*Math.PI*2;
        var expl = new Explosion(this.x+Math.cos(a)*r, this.y+Math.sin(a)*r);
        expl.animation.delay_time = t;
      }  
    }
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
              Game.shots.push(new Shot(this,this.x+dx*10+this.vx, this.y+dy*10+this.vy, this.vx, this.vy, 10, this.rot, 250));
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
  //jQuery.extend(this, new Sprite([], Ship.getNextColor()));
  jQuery.extend(this, new Sprite(80, 'ship'));
  this.offset_x = 3; this.offset_y = -1;
  Game.main_sprite.child_sprites.push(this);
  this.scale = 0.9;
  var ship = this;
  var flame_sprite = new Sprite(80, 'flame');
  flame_sprite.y = 20; flame_sprite.alpha = 0.7;
  flame_sprite.display = function() { return ship.hasAccel() };
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);
//  // energy bar
//  var ship = this;
//  var energy_sprite = new Sprite([], '');
//  energy_sprite.extra_draw = function(ctx) {
//    ctx.fillStyle = 'rgba(0,255,0,0.5)';
//    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
//    var w = 30*ship.energy*0.01;
//    ctx.fillRect(-15,20,w,4);
//    ctx.strokeRect(-15,20,30,4);
//  }
//  this.child_sprites.push(energy_sprite);
}
