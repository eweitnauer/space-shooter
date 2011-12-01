/** The alien base class for all actual aliens in the game. Defines sensors and
a sense function as well as some basic behaviors that can be configured by the
child classes. */

/// Creator that sets initializes the sprite and spawns the alien.
var Alien = function() {
  this.type = 'alien';      // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensors = [];        // an array of sensors results
  this.sensor_range = 100;  // max. sensor range
  this.v_max = 1.0;         // maximum speed
  this.turn_speed = 0.15;   // turning speed
  this.acceleration = 0.02; // acceleration
  this.coins = 1;           // coins the players get on destruction
  
  this.sprite_name = '';     // visual appearance of the alien
  this.explosion_size = 'L'; // size of the explosion when destroyed
  this.explosion_scale = 1.0; // scale for explosions
  this.shockwave =           // shockwave parameters (on explosion)
    { damage: 0              // max. damage dealt for affected objects
     ,damage_r1: 0           // if sth. is closer than this, deal max. damage
     ,damage_r2: 0           // if sth. is farer than this, deal no damage
     ,dvel: 0                // max. delta velocity for affected objects
     ,vel_r: 0               // if sth. is farer than this, don't change vel.
    };
  this.collision_radius = 12; // collision radius for physics
  this.restitution = 0.5;   // restitution for collision
  this.mass = 2;            // mass of ship
  this.max_energy = 100;    // energy at creation
}

/// Makes the alien into a sprite adds it to the main game sprite. Also adds
/// itself to the Game's aliens list.
Alien.prototype.init_sprite = function() {
  // a bit complicated, but this way, the sprite does not override any
  // properties already set in this
  jQuery.extend(this, jQuery.extend(new Sprite(80, this.sprite_name), this));
  Game.main_sprite.child_sprites.push(this);
  Game.aliens.push(this);
}

/// Place alien at random location and display it.
Alien.prototype.spawn = function() {
  this.display = true;
  this.destroyed = false;
  var pos = Game.getRandomPos(this.collision_radius);
  this.x = pos.x; this.y = pos.y;
  this.vx = 0; this.vy = 0;
  this.energy = this.max_energy;
}

/// Is called externally when something damaged the alien. The amount of damage
/// is passed. The alien will destroy itself if its energy drops to or below 0.
Alien.prototype.hit = function(energy,otherType){
  if (this.destroyed) return;
  if (this.energy<=energy) this.destroy();
  else this.energy -= energy;
}

/// Hides the alien, sets its energy to zero and triggers an explosion.
/// It should be removed from the Game's alien list and from the sprite list.
Alien.prototype.destroy = function() {
  this.destroyed = true;
  this.energy = 0;
  this.explode();
  this.display = false;
  this.animation.finished = true;

  if(this.coins){
    Game.coins += this.coins;
    var p = new PointObject(this.x,this.y, this.coins);
    Game.pointObjects.push(p);
    Game.main_sprite.child_sprites.push(p);
  }
  
}

/// Trigger an explosion.
Alien.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, this.explosion_size);
  expl.shockwave(this.shockwave);
  expl.scale = this.explosion_scale;
}

Alien.prototype.is_moving = function() { return this.vx != 0 || this.vy != 0; }

/// Turn left by this.turn_speed*frac. If no frac is passed, it is set to 1.
Alien.prototype.turn_left = function(frac) {
  if (arguments.length < 1) var frac = 1;
  this.turn(-this.turn_speed*frac);
}

/// Turn right by this.turn_speed*frac. If no frac is passed, it is set to 1.
Alien.prototype.turn_right = function(frac) {
  if (arguments.length < 1) var frac = 1;
  this.turn(this.turn_speed*frac);
}

/// Turn towards the passed position (maximum rot. per step is this.turn_speed).
Alien.prototype.turn_towards = function(x, y) {
  var drot = -norm_rotation(Math.atan2(this.vy, this.vx) - Math.atan2(y-this.y, x-this.x));
  if (drot > 0) this.turn(Math.min(drot, this.turn_speed));
  else if (drot < 0) this.turn(Math.max(drot, -this.turn_speed));
}

/// Turn away from the passed position (maximum rot. per step is this.turn_speed).
Alien.prototype.turn_away_from = function(x, y) {
  var drot = norm_rotation(Math.atan2(this.vy, this.vx) - Math.atan2(y-this.y, x-this.x));
  if (drot > 0) this.turn(Math.min(drot, this.turn_speed));
  else if (drot < 0) this.turn(Math.max(drot, -this.turn_speed));
}

/// Turns around by modifying vx and vy.
Alien.prototype.turn = function(angle) {
  var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  dir += angle;
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
}

/// If slower than v_max, accelerate. If faster than v_max, deccelerate. If
/// slow_down is passed as true, deccelerate until alien comes to an halt.
Alien.prototype.adjust_speed = function(slow_down) {
  var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  if (slow_down || v>this.v_max) v = Math.max(0, v-this.acceleration);
  if (!slow_down && v<this.v_max) v = Math.min(this.v_max, v+this.acceleration);
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
}

/// Set the sprite rotation according to the current vx.
Alien.prototype.adjust_rot = function(mult) {
  if (arguments.length<1) var mult = 0.05;
  this.rot = Math.PI*mult*this.vx/this.v_max;
}


/// Around the alien, there are N radial sensors. Each sensor will return the
/// inner distance to the closest object in its direction if the object is
/// inside the sensor range. Sensors react only to the types of objects passed
/// in the 'obj_type' argument. If nothing or 'false' is passed, all object types
/// are sensed.
/// The sensor results are written into the sensors array as [dist, obj] pairs.
Alien.prototype.sense = function(max_dist, obj_types) {
  // empty all sensors
  for (var i=0; i<this.sensor_count; i++) this.sensors[i] = null;
  // set own pos and dir
  var self = this;
  var my_pos = new Point(this.x, this.y);
  var my_rot = Math.atan2(this.vy, this.vx);
  // helper function
  var sense_obj = function(P) {
    var d = inner_dist(P, self);
    if (d > max_dist) return;
    var angle = norm_rotation2(Math.atan2(P.y-self.y, P.x-self.x)-my_rot);
    var idx = Math.floor(angle/Math.PI/2*self.sensor_count);
    if (self.sensors[idx] == null || self.sensors[idx][0] > d) {
      self.sensors[idx] = [d, P];
    }
  }
  Game.forEachPhysicalObject(function(obj) {
    if (obj === self) return;
    if (obj_types && !(obj.type in obj_types)) return;
    if (obj.type == 'landscape') {
      var P = Point.get_closest_point_on_segment(obj.A, obj.B, my_pos);
      P.type = 'landscape';
      sense_obj(P);
    } else sense_obj(obj);
  });
}

/// For debugging purposes: draws the sensor results and flying direction.
Alien.prototype.visualize_sensors = function(ctx) {
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x+this.vx*20, this.y+this.vy*20);
  ctx.stroke();
  if (this.mark_in_vis) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(this.x, this.y, 4, 0, Math.PI*2, true);
    ctx.fill();
  }
  this.sense(this.sensor_range);
  var N = this.sensor_count;
  var dir = Math.atan2(this.vy, this.vx);
  var colors = {alien_shot: 'orange', alien_ship: 'red', ship: 'green', landscape: 'green'};
  for (var i=0; i<N; i++) {
    if (!this.sensors[i]) continue;
    ctx.strokeStyle = colors[this.sensors[i][1].type];
    ctx.beginPath();
    var rot = dir+(i+0.5)*Math.PI*2/N;
    ctx.moveTo(this.x + Math.cos(rot) * this.collision_radius,
               this.y + Math.sin(rot) * this.collision_radius);
    ctx.lineTo(this.x + Math.cos(rot) * this.sensors[i][0],
               this.y + Math.sin(rot) * this.sensors[i][0]);
    ctx.stroke();
  }
}

/// The prefered_dist parameter can either be a number (e.g. 80) or a type-distance
/// hash (e.g. {'landscape':80, 'ship':120}). In the first case, the prefered
/// distance is set for all object types, in the second case, its set specific
/// and interpreted as 0 for all types not included in the hash.
/// As all behaviors it returns true, if it took some action and false, if all
/// objects where far enough an nothing was done.
Alien.prototype.avoid_obstacles_behavior = function(prefered_dist) {
  // set convinience variables
  var N = this.sensor_count;
  var N2 = Math.floor(this.sensor_count/2); if (N%2==0) N2--;
  var rot = Math.atan2(this.vy, this.vx);
  
  // determine the maximum of the prefered distances
  var max_dist = 0;
  if (typeof(prefered_dist) == 'number') max_dist = prefered_dist;
  else for (var type in prefered_dist) {
    max_dist = Math.max(max_dist, prefered_dist[type]);
  }
  
  var min_dist = max_dist; // minimum of all sensed distances
  var sum = 0;
  for (var i=0; i<N; i++) {
    // continue if sensor is empty
    if (this.sensors[i] == null) continue;
    // continue if sensor points exactly backwards (no left-right decision possible)
    if ((N % 2 == 1) && (i == N2)) continue;
    // get prefered dist for the type of object sensed
    var pd = (typeof(prefered_dist) == 'number')
      ? prefered_dist : prefered_dist[this.sensors[i][1].type];
    // continue if object is far enough
    if (!pd || this.sensors[i][0] > pd) continue;
    // add or sub difference between actual and prefered distance to the sum
    // depending on which side the sensor is
    if (i <= N2) sum += (pd - this.sensors[i][0]);
    else sum -= (pd-this.sensors[i][0]);
    if (min_dist > this.sensors[i][0]) min_dist = this.sensors[i][0];
  }
  /// now turn away from the obstacle (higher probability for closer obstacles)
  if ((sum != 0) && (Math.random()*0.5 < 1-min_dist/max_dist)) {
    var factor = 1-min_dist/max_dist;
    sum < 0 ? this.turn_right(factor) : this.turn_left(factor);
  }
  return sum!=0;
}

/// Step function that should be called every 
Alien.prototype.step = function() {
  this.think();
  this.adjust_speed();
  this.x += this.vx;
  this.y += this.vy;
  this.adjust_rot();
}

/// Think function, should call the sense function first and then all bahaviors
/// in order of their priority as long as they return false.
Alien.prototype.think = function() {
  this.sense(this.sensor_range);
  if (this.avoid_obstacles_behavior(this.sensor_range)) return;
  return;
}

