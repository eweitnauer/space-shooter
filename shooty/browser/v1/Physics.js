function dist(p1, p2) {
  var dx = p1.x-p2.x, dy = p1.y-p2.y;
  return Math.sqrt(dx*dx+dy*dy);
}

/// Pass two shape objects (they have properties x,y,r) and a function that is
/// called when a collision occours. It is passed the following parameter:
/// callback(o1, o2, coll_x, coll_y) 
function check_collision(o1, o2, callback) {
  if (dist(o1, o2) < o1.r+o2.r) {
    callback(o1, o2, (o1.x+o2.x)/2, (o1.y+o2.y)/2);
  }
}

/// The function expects two objects (with properties x,y,r,mass,v). It then
/// calculates the effect of an elastic collision and sets the speeds of the
/// objects accordingly. 
function let_collide(o1, o2) {
}
