var Mine = function(x, y) {
  this.type = 'alien';
  this.max_vx = 1.5; this.max_vy = 1.5;
  this.init_sprite();
  this.spawn(x, y);
}

Mine.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite(80, 'alien_mine'));
  this.collision_radius = 9;
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
  this.vx = 0; this.vy = this.max_vy/2;
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

Mine.prototype.think = function() {
}
