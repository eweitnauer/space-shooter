function Vec2(x,y) {
  this.x = x;
  this.y = y;
  this.normalize = function() {
    var l = 1/this.length();
    this.x *= l;
    this.y *= l;
  }
  this.length = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }
  this.scalar = function(o) {
    return this.x*o.x + this.y*o.y;
  }
  this.scaled = function(s) {
    return new Vec2(this.x*s, this.y*s);
  }
  this.add = function(o) {
    this.x += o.x; this.y += o.y;
    return this;
  }
}

function dist(p1, p2) {
  var dx = p1.x-p2.x, dy = p1.y-p2.y;
  return Math.sqrt(dx*dx+dy*dy);
}

Physics = {
/// Pass two shape objects (they have properties x,y,r) and a function that is
/// called when a collision occours. It is passed the following parameter:
/// callback(o1, o2, coll_x, coll_y) 
checkCollision: function(o1, o2, callback) {
  if (dist(o1, o2) < o1.collision_radius+o2.collision_radius) {
    callback(o1, o2, (o1.x+o2.x)/2, (o1.y+o2.y)/2);
  }
}

/// The function expects two objects (with properties x,y,r,mass,vx,vy). It then
/// calculates the effect of an elastic collision and sets the speeds of the
/// objects accordingly.
/// Returns the energy of the impact. 
,letCollide: function(o1, o2) {
  var v1 = new Vec2(o1.vx, o1.vy);
  var v2 = new Vec2(o2.vx, o2.vy);
  // get the speed components in radial direction
  var rad = new Vec2(o2.x-o1.x, o2.y-o1.y);
  rad.normalize();
  var v1_r = rad.scalar(v1);
  var v2_r = rad.scalar(v2);
  // get the speed components in tangential direction
  var tang = new Vec2(-rad.y, rad.x);
  var v1_t = tang.scalar(v1);
  var v2_t = tang.scalar(v2);
  // calculate new radial speeds after collision
  var v_mean = 2*(o1.mass*v1_r + o2.mass*v2_r)/(o1.mass+o2.mass);
  var v1_r_new = v_mean-v1_r;   
  var v2_r_new = v_mean-v2_r;
  // set new speeds by combining the new radial and the tangential directions
  v1 = tang.scaled(v1_t).add(rad.scaled(v1_r_new));
  v2 = tang.scaled(v2_t).add(rad.scaled(v2_r_new));
  o1.vx = v1.x; o1.vy = v1.y;
  o2.vx = v2.x; o2.vy = v2.y;
  return 0.5*(v1_r-v1_r_new)*(v1_r-v1_r_new)*o1.mass +
         0.5*(v2_r-v2_r_new)*(v2_r-v2_r_new)*o2.mass;
}
}
