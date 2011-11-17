/** An alien ship looking like a flying pyramid. They move around on the whole
    map and release three homing missles in direction of their edges from time to 
    time. */

var Pyramid = function() {
  this.type = 'alien_ship';
  this.sensor_count = 6; // number of sensors
  this.sensors = []; // an array of sensors results
  this.v_max = 1.2;
  this.turn_speed = 0.15;
  this.acceleration = 0.02;
  this.missile_time = 10000; // time between firing missiles
  this.points = 125;

  this.init_sprite();
  this.spawn();
}

Pyramid.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite(80, 'alien_pyramid'));
  Game.main_sprite.child_sprites.push(this);
  Game.aliens.push(this);
}

Pyramid.prototype.spawn = function() {
  this.display = true;
  this.collision_radius = 12;
  this.restitution = 0.5;
  this.mass = 2;
  this.energy = 100;
  this.destroyed = false;
  this.x = Game.borders.left + 2*this.collision_radius +
    Math.random()*(Game.borders.right-Game.borders.left-4*this.collision_radius);
  this.y = Game.borders.top + 2*this.collision_radius + 
    Math.random()*(Game.borders.bottom-Game.borders.top-4*this.collision_radius);
  this.vx = 0; this.vy = 0;
  this.prefered_dir = 'straight';
  this.slow_down = false;
  this.fire_missiles_at = Animation.time + this.missile_time;
}

Pyramid.prototype.hit = function(energy) {
  if (this.destroyed) return;
  if (this.energy<=energy) this.destroy();
  else this.energy -= energy;
}

Pyramid.prototype.destroy = function() {
  this.energy = 0;
  this.explode();
  this.display = false;
  this.destroyed = true;
  this.animation.finished = true;
}

Pyramid.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, 'L');
  expl.rot = Math.random()*Math.PI*2;
}

Pyramid.prototype.is_moving = function() {
  return this.vx != 0 || this.vy != 0;
}

Pyramid.prototype.turn_left = function() { this.turn(-this.turn_speed); }
Pyramid.prototype.turn_right = function() { this.turn(this.turn_speed); }
Pyramid.prototype.turn = function(angle) {
  var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  dir += angle;
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
}

/// Fire missile behavior. Will fire missiles every 'missile_time' ms, but only
/// after it stopped moving.
Pyramid.prototype.fire_missiles_behavior = function() {
  if (Animation.time < this.fire_missiles_at) return false;
  this.slow_down = true;
  if (!this.is_moving()) {
    // fire three missiles and set new time
    for (var deg = 0; deg<360; deg+=120) {
      var rad = (deg-90) * Math.PI / 180;
      new Missile(this.x + Math.cos(rad)*20, this.y + Math.sin(rad)*20,
                  Math.cos(rad), Math.sin(rad));
    }
    this.fire_missiles_at = Animation.time + this.missile_time;
  }  
  return true;
}

/// Around the pyramid, there are N radial sensors. Each sensor will return the
/// inner distance to the closest object in its direction and the object itself
/// if the object is inside the sensor range. Sensors react only to the types of
/// objects passed in the 'obj_type' argument. If nothing or 'false' is passed,
/// all object types are sensed.
/// The sensor results written into the sensors array as [dist, obj] pairs.
Pyramid.prototype.sense = function(max_dist, obj_types) {
  if (arguments.length<2) var obj_types = false;
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

Pyramid.prototype.visualize_sensors = function(ctx) {
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x+this.vx*20, this.y+this.vy*20);
  ctx.stroke();
  if (this.did_random_flight) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(this.x, this.y, 4, 0, Math.PI*2, true);
    ctx.fill();
  }
  this.sense(100);
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
/// hash (e.g. {'landscape':80, 'ship':120}. In the first case, the prefered
/// distance is set for all object types, in the second case its set specific.
Pyramid.prototype.avoid_obstacles_behavior = function(prefered_dist) {
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
    if (this.sensors[i][0] > pd) continue;
    // add or sub difference between actual and prefered distance to the sum
    // depending on which side the sensor is
    if (i <= N2) sum += (pd - this.sensors[i][0]);
    else sum -= (pd-this.sensors[i][0]);
    if (min_dist > this.sensors[i][0]) min_dist = this.sensors[i][0];
  }
  /// now turn away from the obstacle (higher probability for closer obstacles)
  if ((sum != 0) && (Math.random() < 1-min_dist/max_dist)) {
    sum < 0 ? this.turn_right() : this.turn_left();
    return true;
  }
  return false;
}

Pyramid.prototype.random_flight_behavior = function() {
  if (Math.random() < 0.04) {
    this.prefered_dir = Math.random() < 0.5 ? 'straight' : 
      (Math.random() < 0.5 ? 'left' : 'right');
  }
  if (this.prefered_dir != 'straight' && Math.random() < 0.2) {
    if (this.prefered_dir == 'left') this.turn_left();
    else this.turn_right();
  }
  return true;
}

Pyramid.prototype.think = function() {
  this.did_random_flight = false;
  this.slow_down = false;
  this.sense(100);
  if (this.fire_missiles_behavior()) return;
  if (this.avoid_obstacles_behavior({landscape: 100, alien_ship: 100, alien_shot: 20})) return;
  this.did_random_flight = true;
  this.random_flight_behavior();
}

Pyramid.prototype.step = function() {
  this.think();
  this.x += this.vx;
  this.y += this.vy;
  var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  if (this.slow_down || v>this.v_max) v = Math.max(0, v-this.acceleration);
  if (!this.slow_down && v<this.v_max) v = Math.min(this.v_max, v+this.acceleration);
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
  this.rot = Math.PI*0.05*this.vx/this.v_max;
}
