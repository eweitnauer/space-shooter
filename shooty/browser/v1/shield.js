var Hit = function(angle,time){
    this.angle = angle;
    this.time = time;
};

var Shield = function(ship){
  this.ship = ship;
  this.graphics = new Sprite([],"shield-1");
  this.angleStep = 11 /180 * 2 * Math.PI;
  this.init();
  
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
  var angle = Math.atan2(rely,rely);
  this.hits.push(new Hit(angle,10));
}

Shield.prototype.extra_draw = function(ctx){
  ctx.save();
  var self = this;
  this.hits.forEach(function(h,el){
    for(var a=-3; a<=3; ++a){
      self.graphics.rot = h.angle + a* self.angleStep;
        self.graphics.alpha = 1.0-Math.abs(a)/4;
      self.graphics.draw(ctx);
    }
    h.time --;
    if(h.time < 0) el.remove();
  });
  ctx.restore();
}