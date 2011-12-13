///** Classical U.F.O. type of alien ship. It moves on a horizontal line at the
//    top of the screen and releases mines. */
Rocket = function(ship, x, y, rot, warhead_energy, mass, sensor_range, turn_speed, scale) {
  this.ship = ship;
  this.type = 'rocket'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensors = [];        // an array of sensors results
  this.sensor_range = sensor_range;   // max. sensor range
  this.v_max = 5;         // maximum speed
  this.turn_speed = turn_speed;    // turning speed
  this.acceleration = 0.2; // acceleration
  this.points = 0;        // points the players get on destruction
  this.coins = 0;         // coins the players get on destruction
  
  this.sprite_name = 'bullet-rocket';    // visual appearance of the alien
  this.explosion_size = 'L';        // size of the explosion when destroyed
  this.offset_rot = Math.PI/2;               // rotate imgs by 45 deg.
  this.offset_x = this.offset_y = 3; // img offset
  this.collision_radius = 6;         // collision radius for physics
  this.restitution = 0.9;            // restitution for collision
  this.mass = mass;                     // mass of ship
  this.max_energy = 0.1;             // energy at creation
  
  this.init_sprite();
  this.spawn();
  
  this.x = x + 50*Math.sin(rot);
  this.y = y - 50*Math.cos(rot);
  this.vx = this.v_max * Math.sin(rot);
  this.vy = this.v_max * -Math.cos(rot);

  this.rot = Math.atan2(this.vx,this.vy);
  
  this.scale = scale; // adapt from level
  
  this.warhead_energy = warhead_energy;

  var flame_sprite = new Sprite(40, 'flame-rocket');
  flame_sprite.scale = 1;
  flame_sprite.y = 3;
  flame_sprite.x = -12;
  flame_sprite.rot = Math.PI/2;
  flame_sprite.alpha = 0.9;
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);

  
  this.ship.curr_rocket_count++;

}

Rocket.prototype = new Alien();
Rocket.prototype.constructor = Rocket;

Rocket.prototype.explode = function(){
  var expl = new Explosion(this.x, this.y, this.explosion_size);
  expl.rot = Math.random()*Math.PI*2;
  this.ship.curr_rocket_count--;
}



Rocket.prototype.smoke = function() {
  if(Math.random() > 0.5){
    var s = new Smoke(this.x, this.y, 'rocket-XS');
    s.scale = this.scale * (Math.random(0.5) + 0.5);
    s.rot = Math.random() * 2*Math.PI;
    s.alpha = 0.8 + Math.random() *  0.2;
    s.alpha_decay = 0.05 + Math.random() * 0.1;
  }  
}

Rocket.prototype.step = function() {
  this.think();
  this.x += this.vx;
  this.y += this.vy;
  this.smoke();
}

Rocket.prototype.think = function() {
  this.sense(this.sensor_range);
//  this.avoid_obstacles_behavior({landscape: this.sensor_range,
//                                 ship: this.sensor_range,
//                                 alien_shot: 10});
  this.seek_next_alien_behavior();
}

Rocket.prototype.is_left_to = function(x, y) {
  var dx = x-this.x, dy = y-this.y;
  return this.vx*dy - this.vy*dx < 0;
}

Rocket.prototype.turn = function(angle){
  var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  if (v<this.v_max) v += this.acceleration;
  if (v>this.v_max) v -= this.acceleration;
  dir += angle;
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
  this.rot = Math.atan2(this.vy,this.vx);
  
}

Rocket.prototype.seek_next_alien_behavior = function(){
  var closest_alien = null;
  var closest_dist = 100000;
  for(var i=0;i<this.sensor_count;i++){
    if(!this.sensors[i]) continue;
    var d = this.sensors[i][0];
    var o = this.sensors[i][1];
    if(d < closest_dist && /alien/.test(o.type)){//(o.type == 'alien_ship') {
      closest_dist = d;
      closest_alien = o;
    }
  }
  if(closest_alien){
    if(this.is_left_to(closest_alien.x, closest_alien.y)){
      this.turn(-0.1);
    }else{
      this.turn(0.1);
    }
  }else{
    this.rot = Math.atan2(this.vy,this.vx);
  }
}

