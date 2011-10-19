var Ufo = function(sprite) {
  this.type = 'alien';
  this.max_vx = 1.5; this.max_vy = 0.75;
  this.init_sprite();
  this.spawn();
}

Ufo.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite(80, 'alien_ufo'));
  this.offset_rot = Math.PI*0.25;
  this.offset_x = 3; this.offset_y = 3;
  this.collision_radius = 16;
  this.restitution = 0.9;
  this.mass = 3;
  this.display = false;
  Game.main_sprite.child_sprites.push(this);
}

Ufo.prototype.spawn = function() {
  this.energy = 200;
  this.display = true;
  this.destroyed = false;
  this.last_time = Animation.time;
  this.x = Game.borders.left + this.collision_radius + Math.random()*(Game.borders.right-Game.borders.left-2*this.collision_radius);
  this.y = Game.borders.top + this.collision_radius + Math.random()*(Game.borders.bottom-Game.borders.top-2*this.collision_radius);
  this.vx = 0; this.vy = 0;
  this.change_speed();
  this.adjust_rot();
}

Ufo.prototype.change_speed = function() {
  this.vx += (Math.random()-0.5) * this.max_vx * 0.25;
  this.vy += (Math.random()-0.5) * this.max_vy * 0.25;
  this.vx = Math.clipped(this.vx, -this.max_vx, this.max_vx);
  this.vy = Math.clipped(this.vy, -this.max_vy, this.max_vy);
}

Ufo.prototype.adjust_rot = function() {
  this.rot = Math.PI*0.07*this.vx/this.max_vx;
}

Ufo.prototype.hit = function(energy) {
  if (this.energy<=energy) this.destroy();
  else this.energy -= energy;
}

Ufo.prototype.destroy = function() {
  this.energy = 0;
  this.explode();
  this.destroyed = true;
  this.display = false;
  this.animation.finished = true;
}

Ufo.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, 'L');
  expl.rot = Math.random()*Math.PI*2;
}

Ufo.prototype.step = function() {
  this.think();
  this.x += this.vx;
  this.y += this.vy;
}

Ufo.prototype.think = function() {
  if (Math.random() < 0.25) this.change_speed();
  if (this.x-12 < Game.borders.left) this.vx = Math.abs(this.vx);
  if (this.x+12 > Game.borders.right) this.vx = -Math.abs(this.vx);
  if (this.y-12 < Game.borders.top) this.vy = Math.abs(this.vy);
  if (this.y+12 > Game.borders.bottom) this.vy = -Math.abs(this.vy);
  this.adjust_rot();
}

