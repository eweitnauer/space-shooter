var Mine = function(x, y) {
  this.type = 'alien';
  this.max_v = 1;
  this.turn_speed = 0.1;
  this.acceleration = 0.02;
  this.sensors = [];
  this.sensor_count = 10;
  this.init_sprite();
  this.spawn(x, y);
}

Mine.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite(80, 'alien_mine'));
  this.scale = 0.8;
  this.collision_radius = 4;
  this.restitution = 0.3;
  this.mass = 0.1;
  this.display = false;
  this.rot = Math.random()*Math.PI*2;
  this.drot = Math.randomSign() * 0.04;
  Game.main_sprite.child_sprites.push(this);
  Game.aliens.push(this);
}

Mine.prototype.spawn = function(x, y) {
  this.energy = 30;
  this.display = true;
  this.destroyed = false;
  this.x = x; this.y = y;
  this.vx = 0; this.vy = this.max_v/2;
  this.prefered_dir = Math.random() < 0.5 ? 'left' : 'right';
}

Mine.prototype.hit = function(energy) {
  if (this.energy<=energy) this.destroy();
  else this.energy -= energy;
}

Mine.prototype.destroy = function() {
  this.energy = 0;
  this.explode();
  this.destroyed = true;
  this.display = false;
  this.animation.finished = true;
}

Mine.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, 'L');
  expl.rot = Math.random()*Math.PI*2;
}

Mine.prototype.step = function() {
  this.think();
  this.x += this.vx;
  this.y += this.vy;
  this.rot += this.drot;
}

Mine.prototype.is_left_to = function(x, y) {
  var dx = x-this.x, dy = y-this.y;
  return this.vx*dy - this.vy*dx < 0;
}

Mine.prototype.turn_left = function() { this.turn(-this.turn_speed); }
Mine.prototype.turn_right = function() { this.turn(this.turn_speed); }
Mine.prototype.turn = function(angle) {
  if (this.vy == 0 && this.vx == 0) var dir = 0;
  else var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  if (v<this.max_v) v += this.acceleration;
  if (v>this.max_v) v = this.max_v;
  dir += angle;
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
}

/// Around the mine, there are N radial sensors. Each sensor will return the
/// distance to the closest object in its direction and the objects type.
/// Possible types are 'obstacle' (for landscape and aliens) and 'mine' for
/// other mines. The sensor results are returned as an array of [dist, type]
/// pairs.
Mine.prototype.sense = function(max_dist) {
  // empty all sensors
  for (var i=0; i<this.sensor_count; i++) this.sensors[i] = null;
  // set own pos and dir
  var self = this;
  var my_pos = new Point(this.x, this.y);
  var my_rot = Math.atan2(this.vy, this.vx);
  // helper function
  var sense_obj = function(P, type) {
    var d = dist(P, my_pos);
    if (d > max_dist) return;
    var angle = norm_rotation2(Math.atan2(P.y-my_pos.y, P.x-my_pos.x)-my_rot);
    var idx = Math.floor(angle/Math.PI/2*self.sensor_count);
//    if (idx > 4 && idx < self.sensor_count-5) return;
    if (self.sensors[idx] == null || self.sensors[idx][0] > d) {
      self.sensors[idx] = [d, type, P];
    }
  }
  // check all aliens
  Game.aliens.forEach(function(alien) {
    if (alien === self) return;
    sense_obj(alien, alien instanceof Mine ? 'mine' : 'obstacle');
  });
  // check landscape
  for (var i=0; i<Game.lines.length; ++i) {
    var line = Game.lines[i];
    var C = Point.get_closest_point_on_segment(line.A, line.B, my_pos);
    sense_obj(C, 'obstacle');
  }
  // check ships
  Game.forEachActiveShip(function(ship) {
    sense_obj(ship, 'ship');
  });  
}

Mine.prototype.visualize_sensors = function(ctx) {
  this.sense(250);
  var N = this.sensor_count;
  var rot = Math.atan2(this.vy, this.vx);
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null) continue;
    //ctx.strokeStyle = this.sensors[i][1] == 'mine' ? 'green' : 'red';
    ctx.strokeStyle = 'green';
    if (this.sensors[i][1] != 'ship') continue;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + Math.cos(rot+(i+0.5)*Math.PI*2/N) * this.sensors[i][0],
               this.y + Math.sin(rot+(i+0.5)*Math.PI*2/N) * this.sensors[i][0]);
    ctx.stroke();
  }
}

/// avoid obstacles
Mine.prototype.avoid_obstacles = function(max_dist, include_mines) {
  var N = this.sensor_count;
  var rot = Math.atan2(this.vy, this.vx);
  var fy = 0;
  var mind = max_dist;
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null) continue;
    if (this.sensors[i][1] == 'ship') continue;
    if (!include_mines && this.sensors[i][1] == 'mine') continue;
    if (this.sensors[i][0] > max_dist) continue;
    fy += (i<this.sensor_count/2 ? 1 : -1)*(max_dist-this.sensors[i][0]);
    if (mind == null || mind > this.sensors[i][0]) mind = this.sensors[i][0];
  }
  if ((fy != 0) && ((mind < 25) || Math.random() < 0.5)) {
    if (fy < 0) this.turn_right();
    else if (fy > 0) this.turn_left();
    return true;
  }
  return false;
}

// schooling
Mine.prototype.schooling = function(max_dist) {
  var N = this.sensor_count;
  var drot = 0;
  var rot = Math.atan2(this.vy, this.vx);
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null || this.sensors[i][1] != 'mine') continue;
    if (this.sensors[i][0] > max_dist) continue;
    if (i >= this.sensor_count*3/8 && i < this.sensor_count*5/8) continue;
    drot += norm_rotation(Math.atan2(this.sensors[i][2].vy, this.sensors[i][2].vx) - rot);
  }
  if (drot > 0) { this.turn_right(); return true; }
  else if (drot < 0) { this.turn_left(); return true; }
  return false;
}


Mine.prototype.hunting = function(max_dist) {
  var ship = null, d=null;
  var N = this.sensor_count;
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null) continue;
    if (this.sensors[i][1] != 'ship') continue;
    if (this.sensors[i][0] > max_dist) continue;
    if (ship == null || this.sensors[i][0] < d) {
      ship = this.sensors[i][2];
      d = this.sensors[i][0];
    }
  }
  if (ship != null) {
    if (this.is_left_to(ship.x, ship.y)) this.turn_left();
    else this.turn_right();
    return true;
  }
  return false;
}

Mine.prototype.random_flight = function() {
  if (Math.random() < 0.04) {
    this.prefered_dir = Math.random() < 0.5 ? 'left' : 'right';
  }
  if (Math.random() < 0.2) {
    if (this.prefered_dir == 'left') this.turn_left();
    else this.turn_right();
  }
}

Mine.prototype.think = function() {
  this.sense(250);
  if (this.avoid_obstacles(20, true)) return;
  if (this.hunting(250)) return;
  if (this.avoid_obstacles(50, false)) return;
  if (this.schooling(80)) return;
  this.random_flight();  
}