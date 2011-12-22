/// Written by Erik Weitnauer, Christof Elbrechter and Rene Tuennermann.
/// eweitnauer@gmail.com

var PointObject = function(x, y, points) {
  jQuery.extend(this,new Sprite());
  this.x = x;
  this.y = y;
  this.points = points;
  this.show_steps = 0;
  this.scale = 0.4;

  this.extra_draw = function(ctx){
    this.scale += 0.004;
    this.x += 0.1;
    this.y -= 0.3;
    if(this.show_steps > 30){
      this.alpha *= 0.95;
    }
    try {
      ctx.save();
      ctx.font = '50px "prelude"';
      ctx.fillStyle = 'rgba(255,120,50,'+(this.alpha)+')'
      ctx.fillText(''+points,14,5);
      ctx.fillStyle = 'rgba(255,240,50,'+(this.alpha)+')'
      ctx.fillText(''+points,12,3);
    } finally { ctx.restore(); }

    this.show_steps ++;
    if(this.show_steps > 42){
      this.animation.finished = true;
    }
  };
};



