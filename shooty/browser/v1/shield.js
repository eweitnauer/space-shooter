var Hit = function(angle,time,alpha){
    this.angle = angle;
    this.time = time;
    this.alpha = alpha;
};

var Shield = function(ship){
  this.ship = ship;
  this.graphics = new Sprite([],"shield-1");
  this.angleStep = 0.32;

  this.init();
    this.alpha_decay_factor = 0.92;
  this.hits = new LinkedList();
}

Shield.prototype = new Sprite();
Shield.prototype.constructor = Shield;

Shield.prototype.init = function(){
  this.graphics.offset_x = 0;
  this.graphics.offset_y = -14;
}
Shield.prototype.hit = function(x,y){
  var relx = x - this.ship.x;
  var rely = y - this.ship.y;
    var angle = -Math.atan2(relx,rely) + Math.PI;
  this.hits.push(new Hit(angle,10,1.0));
}

Shield.prototype.extra_draw = function(ctx){
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.translate(this.ship.x, this.ship.y);
  var self = this;
  this.hits.forEach(function(h,el){
    for(var a=-3; a<=3; ++a){
        var angle = h.angle + a* self.angleStep;;
        self.graphics.rot = angle;
        self.graphics.alpha = h.alpha * (1.0-Math.abs(a)/4);
        self.graphics.draw(ctx);
        /* not working .. : todo draw some sparks by hand (ctx.setPixel ...)
          var s = new Smoke(self.x + Math.sin(angle) * 12 + (Math.random()-0.5) * 4,
          self.y - Math.cos(angle) * 12 + (Math.random()-0.5) * 4,
          'smoke-spark-0');
          s.alpha = 0.8;
          s.scale = 0.4+Math.random()*0.6;
          s.alpha_decay = 0.2+Math.random() * 0.4;
        */
    }
    h.time --;
    h.alpha *= self.alpha_decay_factor;
    if(h.time < 0){
        el.remove();
    }
  });
  ctx.restore();
}