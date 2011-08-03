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

var Shot = function(shooter,x,y,v,rot){
    var self = this;
    this.energy = 10;
    this.collision_radius = 4;
    this.mass = 0.02;
    this.shooter = shooter;
    this.initx = x;
    this.inity = y;
    this.x = x;
    this.y = y;
    this.vx = v *  Math.sin(rot);
    this.vy = v * -Math.cos(rot);
    this.maxDist2 = 300*300;
    this.erase = false;
    this.step = function(){
      this.x += this.vx;
      this.y += this.vy;
      var dx = this.x-this.initx;
      var dy = this.y-this.inity;
      if (dx*dx+dy*dy > this.maxDist2) this.erase = true;
    }
};
