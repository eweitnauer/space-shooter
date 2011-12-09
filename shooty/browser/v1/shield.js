var Hit = function(angle,time,alpha, damage){
    this.angle = angle;
    this.time = time;
    this.alpha = alpha;
    this.damage = damage;
};



var Shield = function(ship, radius, maxEnergy, recoveryPerSec){
  if(typeof(radius) == 'undefined') var radius = 25;
  if(typeof(maxEnergy) == 'undefined') var maxEnergy = 100;
  if(typeof(recoveryPerSec) == 'undefined') var recoveryPerSec = 1;

  this.ship = ship;
  this.graphics = new Sprite([],"shield-1");
  this.angleStep = 0.32;
  this.radius = radius;
  this.alphaDecayFactor = 0.92;
  this.framesHitIsShown = 15;
  this.hits = new LinkedList();
  
  this.maxEnergy = maxEnergy;
  this.recoveryPerSec = recoveryPerSec;
  this.currEnergy = maxEnergy;
  this.energyRatio = 1;
  this.lastTime = null;

}

Shield.prototype = new Sprite();
Shield.prototype.constructor = Shield;


/** Spawns a new hit, returns the amout of damage, that could not be absorbed

*/
Shield.prototype.hit = function(x,y, damage){
  var relx = x - this.ship.x;
  var rely = y - this.ship.y;
  var angle = -Math.atan2(relx,rely) + Math.PI;


  this.currEnergy -= damage;
  if(this.currEnergy <= 0){
    var ret = -this.currEnergy;
    this.currEnergy = 0;
    this.hits.push(new Hit(angle,this.framesHitIsShown * damage/ret,0.2,damage));
    return ret
  }else{
    this.hits.push(new Hit(angle,this.framesHitIsShown,1.0,damage));
    return 0;
  }
}

Shield.prototype.step = function(){
  var now = Animation.time;
  if(this.lastTime == null){
    this.lastTime = now;
    return;
  }
  var dtSec = (now - this.lastTime)/1000;
  this.lastTime = now;
  this.currEnergy += dtSec * this.recoveryPerSec;
  if(this.currEnergy > this.maxEnergy) this.currEnergy = this.maxEnergy;
  this.energyRatio = this.currEnergy/this.maxEnergy;
}

Math.gaussRandom = function(mean, sigma){
  if( typeof(mean) == 'undefined') var mean = 0;
  if( typeof(sigma) == 'undefined') var sigma = 1;
  Math.have_next_gaussian = false;
  Math.next_gaussian = 0;
  if(Math.have_next_gaussian){
    Math.have_next_gaussian = false;
    return Math.next_gaussian * sigma + mean;
  } else{
    var v1=0,v2=0,s=0;
    while(s == 0 || s>=1){
      v1 = 2 * Math.random(1.0)-1;
      v2 = 2 * Math.random(1.0)-1;
      s = v1*v1 + v2*v2;
    }
    
    var fac = Math.sqrt(-2.0*Math.log(s)/s);
    Math.next_gaussian = v2 * fac;
    Math.have_next_gaussian = true;
    return v1 * fac * sigma + mean;
  }
}


Shield.prototype.extra_draw = function(ctx){
  var self = this;
  this.graphics.offset_y = -(this.radius - 10);
  //  this.angleStep = 0.32;
  this.angleStep = 0.32 * (22/this.radius);
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.translate(this.ship.x, this.ship.y);

  // this is still crap
  var fr = ( this.energyRatio < 0.25 ? 255 :
             this.energyRatio < 0.50 ? 200 : 50);
  var fg = ( this.energyRatio < 0.25 ? 100 :
             this.energyRatio < 0.50 ? 255 : 200);
  var fb = ( this.energyRatio < 0.25 ? 0 :
             this.energyRatio < 0.50 ? 100 : 255);
  var fa = ( Math.random() < this.energyRatio) ? 0.25 : 0.1;
  if(this.energyRatio*100  > 1){
  
    // draw the non-hit visualization
    for(var angle=0;angle<Math.PI*2;angle+= 0.1){
      for(var i=0;i<5;++i){
        var r = this.radius - Math.abs(Math.gaussRandom()) * this.radius/12;
        
        
        ctx.fillStyle = ("rgba(" 
                         + Math.round(Math.random() * fr) + ','
                         + Math.round(Math.random() * fg) + ','
                         + Math.round(Math.random() * fb) + ','
                         + fa +')' );
        ctx.fillRect(self.x + Math.sin(angle) * r + (Math.random()-0.5) * 2,
                     self.y - Math.cos(angle) * r + (Math.random()-0.5) * 2,
                     1,1);
      }
    }
  }
  // visualize hits
  this.hits.forEach(function(h,el){
    for(var a=-3; a<=3; ++a){
      var angle = h.angle + a* self.angleStep;;
      self.graphics.rot = angle;
      self.graphics.alpha = h.alpha * (1.0-Math.abs(a)/4);
      self.graphics.draw(ctx);
      
      for(var i=0;i<10;++i){
        ctx.fillStyle = ("rgba(" 
                         + Math.round(Math.random() * fr) + ','
                         + Math.round(Math.random() * fg) + ','
                         + Math.round(Math.random() * fb) + ','
                         + self.graphics.alpha +')' );
        ctx.fillRect(self.x + Math.sin(angle) * self.radius + Math.gaussRandom(0,3),
                     self.y - Math.cos(angle) * self.radius + Math.gaussRandom(0,3),
                     Math.random()*2,Math.random()*2);
      }
    }
    h.time --;
    h.alpha *= self.alphaDecayFactor;
    if(h.time < 0){
      el.remove();
    }
  });
  ctx.drawStyle = 'rgb(0,0,0)';
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillText(''+Math.round(self.energyRatio*100)+'%',self.x+30, self.y+10);


  ctx.restore();
}