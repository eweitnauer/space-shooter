/** Classical U.F.O. type of alien ship. It moves on a horizontal line at the
    top of the screen and releases mines. */

var Ufo = function() {
  this.type = 'alien_ship';
  this.max_vx = 1.5;
  this.acceleration = 0.03;
  this.release_rate = 1000; // 1 mine released per x ms
  this.production_time = 5000; // between mine releases we have x ms
  this.max_mine_count = 3; // number of mines per production cycle
  this.points = 100;
  this.max_energy = 100;
  this.init_sprite();
  this.spawn();
}

Ufo.prototype.init_sprite = function() {
  jQuery.extend(this, new Sprite(80, 'alien_ufo'));
  this.offset_rot = Math.PI*0.25;
  this.offset_x = 3; this.offset_y = 3;
  this.collision_radius = 16;
  this.restitution = 0.9;
  this.mass = 4;
  this.display = false;
  Game.main_sprite.child_sprites.push(this);
  Game.aliens.push(this);
}

Ufo.prototype.spawn = function() {
  this.next_production_finished_at = Animation.time+this.production_time;
  this.state = 'flying';
  this.energy = this.max_energy;
  this.display = true;
  this.destroyed = false;
  this.x = Game.borders.left + this.collision_radius + Math.random()*(Game.borders.right-Game.borders.left-2*this.collision_radius);
  this.y = Game.borders.top + this.collision_radius + Math.random()*0.2*(Game.borders.bottom-Game.borders.top-2*this.collision_radius);
  this.vx = 0; this.vy = 0;
  this.preferedDir = Math.random() < 0.5 ? 'left' : 'right';
}

Ufo.prototype.change_speed = function() {
  this.vx += (Math.random()-0.5) * this.max_vx * 0.25;
  this.vy += (Math.random()-0.5) * this.max_vy * 0.25;
  this.vx = Math.clipped(this.vx, -this.max_vx, this.max_vx);
  this.vy = Math.clipped(this.vy, -this.max_vy, this.max_vy);
}

Ufo.prototype.hit = function(energy) {
  if (this.destroyed) return;
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
  var e;
  for(var i=0;i;++i){
    e = new Explosion(this.x,this.y,Math.random() < 0.5 ? 'S' : 'L');
    e.scale = 0.8 + 0.4*Math.random();
    e.animation.delay = Math.random()*40;
  }
  e = new Explosion(this.x, this.y, 'XXL');
}

Ufo.prototype.smoke = function() {
  if (this.energy > this.max_energy*0.5) return;
  if (Math.random()*this.max_energy*0.5 > this.energy && Math.random() > 0.25) {
    var s = new Smoke(this.x, this.y, 'smoke-large', this);
    //    s.alpha = (60-this.engery)/60*0.7 + Math.random() * 0.3;
    //    s.scale = 0.4+Math.random()*0.2;
    //    s.alpha_decay = 0.02+Math.random()*0.3;
  }
}

Ufo.prototype.step = function() {
  this.think();
  this.x += this.vx;
  this.y += this.vy;
  this.smoke();
  this.rot = Math.PI*0.035*this.vx/this.max_vx;
}

Ufo.prototype.think = function() {
  if (this.x > Game.borders.right-80) this.preferedDir = 'left';
  if (this.x < Game.borders.left+80) this.preferedDir = 'right';
  if (this.preferedDir == 'left') {
    if (this.vx > -this.max_vx) this.vx -= this.acceleration;
  } else {
    if (this.vx < this.max_vx) this.vx += this.acceleration;
  }
  this.vy = 0;
  if (this.state == 'flying') {
    if (Animation.time >= this.next_production_finished_at) {
      //      if (this.is_moving()) {
      //        this.slow_down();
      //        this.adjust_rot(); 
      //      } else {
      console.log('switching to state "releasing mines"');
      this.state = 'releasing mines';
      this.mines = this.max_mine_count;
      this.next_mine_release_at = Animation.time + this.release_rate;
      //      }
    }
  } else if (this.state == 'releasing mines') {
    if (Animation.time >= this.next_mine_release_at) {
      if (this.mines == 0) {
        console.log('switching to state "flying"');
        this.state = 'flying';
        this.next_production_finished_at = Animation.time + this.production_time;
      } else {
        this.next_mine_release_at = Animation.time + this.release_rate;
        this.release_mine();
      }
    }
  }
}

Ufo.prototype.is_moving = function() {
  return (this.vx != 0 || this.vy != 0);
}

Ufo.prototype.release_mine = function() {
  console.log(new Mine(this.x, this.y + 25, 0, 1));
  this.mines--;
}
