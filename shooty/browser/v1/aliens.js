var Alien = function(type) {
  this.init_sprite();
  this.x = 320;
  this.y = 250;
  this.rot = 0;
  this.vx = 3;
  this.vy = 0;
  this.collision_radius = 12;
  this.restitution = 0.90;
  this.mass = 2;
  this.energy = 100;
  this.destroyed = false;
}
Alien.prototype.init_sprite = function() {
    jQuery.extend(this, new Sprite(80, 'alien_pyramid'));
    Game.main_sprite.child_sprites.push(this);
    this.scale = 1.0;
 }

Alien.prototype.hit = function(energy) {
  if (this.destroyed) return;
  if (this.energy<=energy) this.destroy();
  else this.energy -= energy;
}

Alien.prototype.destroy = function() {
  this.energy = 0;
  this.explode();
  this.display = false;
  this.destroyed = true;
  this.display = false;
  this.animation.finished = true;
}

Alien.prototype.explode = function(){
  var expl = new Explosion(this.x, this.y, 'L');
  expl.rot = Math.random()*Math.PI*2;
}

Alien.prototype.step = function(){
    this.x += this.vx;
    if(this.x > 800) this.vx *= -1;
    if(this.x < 300) this.vx *= -1;
}
