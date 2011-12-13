Cannon = function(x,y){
  this.type = 'alien_ship';
  this.points = 5;
  this.coins = 5;
  this.sprite_name = 'alien-cannon';
  this.explosion_size = 'M';
  this.collision_radius = 16;
  this.restitution = 0.5;
  this.mass = 20;
  this.max_energy = 200;

  this.init_sprite();
  this.pipe = new Sprite([],'alien-cannon-pipe')
  this.pipe_angle = 0;
  this.min_pipe_angle = -Math.PI/2 ;
  this.max_pipe_angle = Math.PI/2;
  this.max_pipe_rotation_speed = 0.05;
  this.init_sprite_cannon();
  
  this.x = x;
  this.y = y;
  this.scale = 0.6;
  
  this.shoot_interval = 3200;
  this.last_shoot_time = Animation.time;
  this.shot_speed = 1;
  this.shot_energy = 5;

  this.max_pipe_length = 30;  
  this.pipe_length = this.max_pipe_length;
  this.min_pipe_length = 20;
}

Cannon.prototype = new Alien();
Cannon.prototype.constructor = Cannon;
/*
  Cannon.prototype.spawn = function(){
  this.display = true;
  this.destroyed = false;
  this.vx = 0; this.vy = 0;
  this.energy = this.max_energy;
  }
*/
Cannon.prototype.init_sprite_cannon = function(){
  this.pipe.draw_in_front_of_parent = false;
  this.pipe.scale = 0.7;
  this.child_sprites.push(this.pipe);
  this.pipe.offset_rot = Math.PI/2;
  this.offset_y = 0;//10;
}


Cannon.prototype.step = function(){
  this.think();
}

Cannon.prototype.shoot = function(){
  /*
    var s = new Shot(this.shot_level,null,
    this.x+Math.sin(r)*10,
    this.y-Math.cos(r)*10,
    0,0, this.shot_speed,r,
    this.shot_energy,this.shot_max_dist,
    function(s){
    s.alpha *= 0.99;
    });
  */
}

Cannon.prototype.shoot_behaviour = function(){
  /*
    if( (Animation.time - this.last_shoot_time) > this.shoot_interval){
    this.last_shoot_time = Animation.time;
    this.shoot();
    } 
  */
}
Cannon.prototype.move_pipe_behaviour = function(){
  this.pipe_angle += (Math.random()-0.0)*0.1;
  if(this.pipe_angle > this.max_pipe_angle) this.pipe_angle = this.max_pipe_angle;
  if(this.pipe_angle < this.min_pipe_angle) this.pipe_angle = this.min_pipe_angle;
  
  if(this.pipe_angle == this.max_pipe_angle) this.pipe_angle = this.min_pipe_angle;
  console.log('this.pipe_angle', this.pipe_angle)
  this.pipe.rot = this.pipe_angle;

  this.pipe.x = Math.sin(this.pipe_angle) * this.pipe_length;
  this.pipe.y = -Math.cos(this.pipe_angle) * this.pipe_length;
}

Cannon.prototype.think = function(){
  this.sense(this.sensor_range);
  this.move_pipe_behaviour();
  this.shoot_behaviour();
}


Cannon.prototype.explode = function(){
  var expl = new Explosion(this.x, this.y, this.explosion_size);
}