var Mine = function(x, y) {
  this.type = 'alien';
  this.max_v = 1.5;
  this.acceleration = 0.05;
  this.init_sprite();
  this.spawn(x, y);
}

Mine.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite(80, 'alien_mine'));
  this.scale = 0.8;
  this.collision_radius = 7;
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

Mine.prototype.turn_left = function() { this.turn(-0.1); }
Mine.prototype.turn_right = function() { this.turn(0.1); }
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

Mine.prototype.think = function() {
  // get closest landscape feature
  d = null; var pt = null;
  var P = new Point(this.x, this.y);
  for (var i=0; i<Game.lines.length; ++i) {
    var line = Game.lines[i];
    var C = Point.get_closest_point_on_segment(line.A, line.B, P);
    if (pt == null || C.dist(P) < d) {
      d = C.dist(P);
      pt = C;
    }
  }
  // avoid if too close
  if (d < 30) {
    if (this.is_left_to(pt.x, pt.y)) this.turn_right();
    else this.turn_left();
    return;
  }

  // get closest ship
  var d = null; var ship = null;
  Game.forEachActiveShip(function(s) {
    if (ship == null || dist(this, s) < d) {
      d = dist(this, s); ship = s;
    }
  });
  if (ship == null) return;
  // now follow the ship
  if (this.is_left_to(ship.x, ship.y)) this.turn_left();
  else this.turn_right();
  
}
