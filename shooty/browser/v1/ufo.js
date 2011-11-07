var Ufo = function() {
  this.type = 'alien_ship';
  this.max_vx = 1.5; this.max_vy = 0.75;
  this.release_rate = 1000; // 1 mine released per x ms
  this.production_time = 5000; // between mine releases we have x ms
  this.max_mine_count = 3; // number of mines per production cycle
  this.points = 100;
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
  Game.aliens.push(this);
}

Ufo.prototype.spawn = function() {
  this.next_production_finished_at = Animation.time+this.production_time;
  this.state = 'flying';
  this.energy = 100;
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
        e.rot = Math.random()*Math.PI*2;
        e.scale = 0.8 + 0.4*Math.random();
        e.animation.delay = Math.random()*40;
    }

    e = new Explosion(this.x, this.y, 'XXL');
    e.rot = Math.random()*Math.PI*2;
    
}

Ufo.prototype.step = function() {
  this.think();
  this.x += this.vx;
  this.y += this.vy;
  this.last_time = Animation.time;
    if(this.energy < 60){ // sollte mit zunehmendem schaden stärker werden ...
        if(Math.random()*60 > this.energy && Math.random() > 0.5){
            var s = new Smoke(this.x,this.y,'smoke-large');
            s.rot = Math.random()*1.5-0.75;
            s.alpha = (60-this.engery)/60*0.7 + Math.random() * 0.3;
            s.scale = 0.4+Math.random()*0.2;
            s.alpha_decay = 0.02+Math.random()*0.3;
        }
    } 
}

Ufo.prototype.think = function() {
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
    } else {
      this.random_walk();
    }
  } else if (this.state == 'releasing mines') {
    if (Animation.time >= this.next_mine_release_at) {
      if (this.mines == 0) {
        console.log('switching to state "flying"');
        this.state = 'flying';
        this.next_production_finished_at = Animation.time + this.production_time;
        this.random_walk();
      } else {
        this.next_mine_release_at = Animation.time + this.release_rate;
        this.release_mine();
      }
    }
  }
}

Ufo.prototype.slow_down = function() {
  var dv = this.max_vx / 30;
  if (Math.abs(this.vx) < dv) this.vx = 0;
  else this.vx += (this.vx>0) ? -dv : dv;
  if (Math.abs(this.vy) < dv) this.vy = 0;
  else this.vy += (this.vy>0) ? -dv : dv;
}

Ufo.prototype.is_moving = function() {
  return (this.vx != 0 || this.vy != 0);
}

Ufo.prototype.release_mine = function() {
  console.log(new Mine(this.x, this.y + 25, 0, 1));
  this.mines--;
}

Ufo.prototype.random_walk = function() {
  if (Math.random() < 0.25) this.change_speed();
  if (this.x-12 < Game.borders.left) this.vx = Math.abs(this.vx);
  if (this.x+12 > Game.borders.right) this.vx = -Math.abs(this.vx);
  if (this.y-12 < Game.borders.top) this.vy = Math.abs(this.vy);
  if (this.y+12 > Game.borders.bottom) this.vy = -Math.abs(this.vy);
  this.adjust_rot();    
}
