var Shield = function(ship){
  this.ship = ship;
  this.graphics = new Sprite([],"shield-1");
  this.angleStep = 11;
  this.init();
  
  this.hits = [];
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
  
  this.hits.push({});
}

Shield.prototype.extra_draw = function(ctx){
  ctx.save();
  for(var a=0;a<=360;a+=this.angleStep){
    this.graphics.rot = a/180 * 2 * Math.PI;
    this.graphics.draw(ctx);
  }
  ctx.restore();
}