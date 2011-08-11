var Explosion = function(x, y){
    var self = this;
    this.x = x;
    this.y = y;
    this.time = -1;
    this.isAtEnd = function(){
        return this.time >= 8;
    }
    this.step = function(){
        this.time++;
    }
};

var ExplosionNew = function(x, y) {
  this.init_sprite();
  this.x = x; this.y = y;
}

ExplosionNew.prototype.init_sprite = function() {
  var sprite = new Sprite([100,100,100,100], 'explosion');
  sprite.animation.loop = false;
  jQuery.extend(this, sprite);
  Game.main_sprite.child_sprites.push(this);
}

var Smoke = function(x,y){
    var self = this;
    this.x = x;
    this.y = y;
    this.time = -1;
    this.isAtEnd = function(){
        return this.time >= 8;
    }
    this.step = function(){
        this.time++;
    }
};

var Shot = function(shooter,x,y,vx,vy,v,rot){
  this.init_sprite();
  this.energy = 5;
  this.collision_radius = 4;
  this.mass = 0.02;
  this.shooter = shooter;
  this.initx = x;
  this.inity = y;
  this.x = x;
  this.y = y;
  this.vx = v *  Math.sin(rot) + vx;
  this.vy = v * -Math.cos(rot) + vy;
  this.rot = rot;
  this.maxDist2 = 300*300;
  this.erase = false;
  this.step = function(){
    this.x += this.vx;
    this.y += this.vy;
    var dx = this.x-this.initx;
    var dy = this.y-this.inity;
    if (dx*dx+dy*dy > this.maxDist2) {
      this.display = false;
      this.animation.finished = true;
      this.erase = true;
    }
  }
};

Shot.prototype.init_sprite = function() {
  var sprite = new Sprite([80,80,80], 'shot');
  sprite.offset_x = 5; sprite.offset_y = 6;
  jQuery.extend(this, sprite);
  Game.main_sprite.child_sprites.push(this);
}
