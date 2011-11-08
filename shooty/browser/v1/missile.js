/** Flying missiles, that are released by alien ships. They fly towards the closest
player and move in swarms. The behavior of missiles is implemented in a number of
behavior methods. These methods rely on the missiles' sensors.
The missiles have a number of radial sensors. Each sensor can only detect the
closest object in its direction. */

// To create a missile, pass along the initial position and speed.
var Missile = function(x, y, vx, vy) {
  this.type = 'alien_shot';
  this.sensor_count = 4; // number of sensors
  this.sensors = []; // an array of sensors results
  this.v_max = 0.8;
  this.turn_speed = 0.12;
  this.acceleration = 0.01;
  this.points = 10;

  this.init_sprite();
  this.spawn(x, y, vx, vy);
}

Missile.prototype.init_sprite = function() {
    // alternativ : alien_rocket
    // dann allerdings ohne flame, und mit 100ms
  jQuery.extend(this, new Sprite(80, 'alien_small_rocket')); 
  this.scale = 0.8; // christof changed this from 0.8
  this.collision_radius = 4;
  this.restitution = 0.3;
  this.mass = 0.1;
  this.display = false;
  this.rot = Math.random()*Math.PI*2;
  this.drot = Math.randomSign() * 0.04;

  // die flame brauchen wir nur für die small rocket!
  var flame_sprite = new Sprite(200, 'small_rocket_flame');
  flame_sprite.scale = 1;
  flame_sprite.y = 14; flame_sprite.alpha = 0.9;
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);

  Game.main_sprite.child_sprites.push(this);
  Game.aliens.push(this);
}

Missile.prototype.spawn = function(x, y, vx, vy) {
  this.energy = 15;
  this.display = true;
  this.destroyed = false;
  this.x = x; this.y = y;
  this.vx = vx; this.vy = vy;
  this.last_vx = vx; this.last_vy = vy;
  this.prefered_dir = Math.random() < 0.5 ? 'left' : 'right';
}

/// Called if the missile was hit by something
Missile.prototype.hit = function(energy) {
  if (this.destroyed) return;
  if (this.energy<=energy) this.destroy();
  else this.energy -= energy;
}

/// When the missile is destroyed, there will be an explosion with shock wave and
/// damaging near ships and aliens.
Missile.prototype.destroy = function() {
  this.energy = 0;
  this.destroyed = true;
  this.display = false;
  this.animation.finished = true;
  this.explode();
}

Missile.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, 'M');
  expl.shockwave(0, 0, 30, 15, 5);
}

Missile.prototype.step = function() {
  this.think();
  this.x += this.vx;//(this.vx + this.last_vx)/2;
  this.y += this.vy;//(this.vy + this.last_vy)/2;
//  this.last_vx = this.vx;
//  this.last_vy = this.vy;
  // christof replaced this:  // this.rot += this.drot;
  this.rot = Math.atan2(this.vy, this.vx)+Math.PI/2;

    if(Math.random() > 0.85){
        var r = 18;
        var s = new Smoke(this.x-this.vx*r, this.y-this.vy*r, "very-small-rocket-smoke");
        s.scale = 0.7;
        s.rot = Math.random() * 2*Math.PI;
        s.alpha = 0.8 + Math.random() *  0.2;
        s.alpha_decay = 0.05 + Math.random() * 0.1;
    }
}

Missile.prototype.is_left_to = function(x, y) {
  var dx = x-this.x, dy = y-this.y;
  return this.vx*dy - this.vy*dx < 0;
}

Missile.prototype.turn_away_from = function(x, y) {
  
}

Missile.prototype.turn_towards = function(x, y) {
  
}

Missile.prototype.turn_left = function() { this.turn(-this.turn_speed); }
Missile.prototype.turn_right = function() { this.turn(this.turn_speed); }
Missile.prototype.turn = function(angle) {
  var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  if (v<this.v_max) v += this.acceleration;
  if (v>this.v_max) v -= this.acceleration;
  dir += angle;
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
}

/// Around the missile, there are N radial sensors. Each sensor will return the
/// distance to the closest object in its direction and the objects type.
/// Possible types are 'obstacle' (for landscape and aliens) and 'missile' for
/// other missiles. The sensor results are returned as an array of [dist, type]
/// pairs.
Missile.prototype.sense = function(max_dist) {
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
    sense_obj(alien, alien instanceof Missile ? 'missile' : 'obstacle');
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

Missile.prototype.visualize_sensors = function(ctx) {
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x+this.vx*8, this.y+this.vy*8);
  ctx.stroke();
  if (this.did_random_flight) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(this.x, this.y, 4, 0, Math.PI*2, true);
    ctx.fill();
  }
  this.sense(250);
  var N = this.sensor_count;
  var rot = Math.atan2(this.vy, this.vx);
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null) continue;
    ctx.strokeStyle = this.sensors[i][1] == 'missile' ? 'green' : ('obstacle' ? 'red' : 'orange');
    if (this.sensors[i][1] != 'missile') continue;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + Math.cos(rot+(i+0.5)*Math.PI*2/N) * this.sensors[i][0],
               this.y + Math.sin(rot+(i+0.5)*Math.PI*2/N) * this.sensors[i][0]);
    ctx.stroke();
  }
}

/// avoid obstacles
Missile.prototype.avoid_obstacles = function(max_dist, include_missiles) {
  var N = this.sensor_count;
  var N2 = Math.floor(this.sensor_count/2);
  if (N2%2 ==0) N2--;
  var rot = Math.atan2(this.vy, this.vx);
  var fy = 0;
  var mind = max_dist;
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null) continue;
    if (this.sensors[i][1] == 'ship') continue;
    if (!include_missiles && this.sensors[i][1] == 'missile') continue;
    if (this.sensors[i][0] > max_dist) continue;
    if ((N % 2 == 1) && (i == N2)) continue;
    if (i <= N2) fy += (max_dist-this.sensors[i][0]);
    else fy -= (max_dist-this.sensors[i][0]);
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
Missile.prototype.schooling = function(max_dist) {
  var N = this.sensor_count;
  var drot = 0;
  var rot = Math.atan2(this.vy, this.vx);
  var done = false;
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null || this.sensors[i][1] != 'missile') continue;
    if (this.sensors[i][0] > max_dist) continue;
    if (i >= this.sensor_count*1/4 && i < this.sensor_count*3/4) continue;
    done = true;
    drot += norm_rotation(Math.atan2(this.sensors[i][2].vy, this.sensors[i][2].vx) - rot);
  }
  if (drot > 0) this.turn(Math.min(drot, this.turn_speed));
  else if (drot < 0) this.turn(Math.max(drot, -this.turn_speed));
  return done;
}


Missile.prototype.hunting = function(max_dist) {
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

Missile.prototype.self_destruct = function(max_dist) {
  var self = this;
  Game.forEachActiveShip(function(ship) {
    var d = dist(ship, self) - self.collision_radius - ship.collision_radius;
    if (d<=max_dist) {
      self.destroy();
      return true;
    }
  });
  return false;
}

Missile.prototype.random_flight = function() {
  if (Math.random() < 0.04) {
    this.prefered_dir = Math.random() < 0.5 ? 'left' : 'right';
  }
  if (Math.random() < 0.2) {
    if (this.prefered_dir == 'left') this.turn_left();
    else this.turn_right();
  }
}

Missile.prototype.think = function() {
  this.sense(250);
  this.did_random_flight = false;
  if (this.self_destruct(5)) return;
  if (this.avoid_obstacles(20, true)) return;
  if (this.hunting(250)) return;
  if (this.avoid_obstacles(50, false)) return;
  if (this.schooling(80)) return;
  this.did_random_flight = true;
  this.random_flight();  
}
