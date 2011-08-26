function dist(o1, o2) {
  var dx = o1.x-o2.x, dy=o1.y-o2.y;
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

/// Pass a shape object (has properties x,y,r), a line segment (has points A, B)
/// and a function that is called when a collision occours. It is passed the
/// following parameter: callback(o, l, coll) 
,checkCollision2: function(o, line, callback) {
  var P = new Point(o.x, o.y);
  var C = Point.get_closest_point_on_segment(line.A, line.B, P);
  if (C.dist(P) < o.collision_radius) {
    callback(o, line, C);
  }
}

/// The function expects two objects (with properties x,y,r,mass,vx,vy). It then
/// calculates the effect of an elastic collision and sets the speeds of the
/// objects accordingly.
/// Returns the energy of the impact. 
,letCollide: function(o1, o2) {
  // undo last position update to separate the two objects
  o1.x -= o1.vx; o1.y -= o1.vy; o2.x -= o2.vx; o2.y -= o2.vy;
  var v1 = new Point(o1.vx, o1.vy);
  var v2 = new Point(o2.vx, o2.vy);
  // get the speed components in radial direction
  var rad = new Point(o2.x-o1.x, o2.y-o1.y);
  rad.normalize();
  var v1_r = rad.mul(v1);
  var v2_r = rad.mul(v2);
  // get the speed components in tangential direction
  var tang = new Point(-rad.y, rad.x);
  var v1_t = tang.mul(v1);
  var v2_t = tang.mul(v2);
  // calculate new radial speeds after collision
  var v_mean = 2*(o1.mass*v1_r + o2.mass*v2_r)/(o1.mass+o2.mass);
  var v1_r_new = v_mean-v1_r;
  var v2_r_new = v_mean-v2_r;
  // set new speeds by combining the new radial and the tangential directions
  var restitution = o1.restitution*o2.restitution;
  v1 = tang.scaled(v1_t).add(rad.scaled(v1_r_new*restitution));
  v2 = tang.scaled(v2_t).add(rad.scaled(v2_r_new*restitution));
  o1.vx = v1.x; o1.vy = v1.y;
  o2.vx = v2.x; o2.vy = v2.y;
  return 0.5*(v1_r-v1_r_new)*(v1_r-v1_r_new)*o1.mass +
         0.5*(v2_r-v2_r_new)*(v2_r-v2_r_new)*o2.mass;
}
}