/** An mine that can be released by alien ships. It will fall down ballistically
and attach to the ground. If it comes close a ship, it will explode.*/

/// To create a mine, pass its initial position and speed.
var Mine = function(x,y,vx,vy) {
  this.type = 'alien_shot';
  this.sensor_count = 2; // number of sensors
  this.sensors = []; // an array of sensors results
  this.acceleration = 0.02;
  this.v_max = 2;

  this.init_sprite();
  this.spawn(x,y,vx,vy);
}

Mine.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite(80, 'alien_mine'));
  Game.main_sprite.child_sprites.push(this);
  Game.aliens.push(this);
}

Mine.prototype.spawn = function(x, y, vx, vy) {
  this.display = true;
  this.collision_radius = 4;
  this.restitution = 0;
  this.mass = 0.1;
  this.energy = 25;
  this.destroyed = false;
  this.x = x; this.y = y;
  this.vx = 0; this.vy = 0;
  this.drot = Math.random()<0.5 ? 0.05 : -0.05;
  this.locked = false;
}

Mine.prototype.hit = function(energy, type) {
  if (this.destroyed) return;
  if (arguments.length < 2) var type = 'unknown';
  if (type == 'landscape') {
    this.locked = true;
  } else if (type == 'alien_shot') {
    this.destroy();
  } else {
    if (this.energy<=energy) this.destroy();
    else this.energy -= energy;
  }
}

Mine.prototype.destroy = function() {
  this.destroyed = true;
  this.energy = 0;
  this.display = false;
  this.animation.finished = true;
  this.explode();
}

Mine.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, 'L');
  expl.shockwave(2, 60, 40, 30, 20);
}

Mine.prototype.get_closest_ship = function() {
  var ship = null, d=null, self=this;
  Game.forEachActiveShip(function(s) {
    if (d == null || inner_dist(self, s) < d) {
      ship = s;
      d = inner_dist(self, s);
    }
  });
  return ship;
}

Mine.prototype.move_towards = function(x, y) {
  if (this.y > y) return;
  if (this.x > x) this.vx -= this.acceleration;
  else if (this.x < x) this.vx += this.acceleration;
}
  
Mine.prototype.think = function() {
  var ship = this.get_closest_ship();
  if (!ship) return;
  var dist = inner_dist(this, ship);
  if (dist <= 20) this.destroy();
  else if (dist <= 150) this.move_towards(ship.x, ship.y);
}

Mine.prototype.step = function() {
  this.think();
  if (this.locked) {
    this.vx = 0; this.vy = 0;
  } else {
    this.vy += Game.grav_y;
    var dir = Math.atan2(this.vy, this.vx);
    var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    v = Math.min(v, this.v_max);
    this.vx = v * Math.cos(dir);
    this.vy = v * Math.sin(dir);
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.drot;
  }
}
