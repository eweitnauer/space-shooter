Point = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}
Point.prototype.dist = function(other) {
  var dx = this.x-other.x, dy = this.y-other.y;
  return Math.sqrt(dx*dx + dy*dy);
}
Point.prototype.dist2 = function(other) {
  var dx = this.x-other.x, dy = this.y-other.y;
  return dx*dx + dy*dy;
}
Point.prototype.length = function() {
  return Math.sqrt(this.x*this.x+this.y*this.y);
}
Point.prototype.length2 = function() {
  return this.x*this.x+this.y*this.y;
}
Point.prototype.add = function(other) {
  return new Point(this.x+other.x, this.y+other.y);
}
Point.prototype.sub = function(other) {
  return new Point(this.x-other.x, this.y-other.y);
}
Point.prototype.mul = function(other) {
  return this.x*other.x+this.y*other.y;
}
Point.prototype.cross = function(other) {
  return this.x*other.y-this.y*other.x;
}
Point.prototype.equals = function(other, eps) {
  return (Math.abs(this.x-other.x) < eps) && (Math.abs(this.y-other.y) < eps);
}
Point.prototype.normalize = function() {
  var l = 1/this.length();
  this.x *= l; this.y *= l;
  return this;
}
Point.prototype.normalized = function() {
  var l = 1/this.length();
  return new Point(this.x*l, this.y*l);
}
Point.prototype.scaled = function(s) {
  return new Point(this.x*s, this.y*s);
}
Point.prototype.toString = function() {
  return "(" + this.x + "," + this.y + ")";
}
Point.prototype.clone = function() {
  return new Point(this.x, this.y);
}
Point.EPS = 1e-6;


/// Returns the closest point on a line segment to a given point.
Point.get_closest_point_on_segment = function(A, B, P) {
  var AB = B.sub(A), ABn = AB.normalized();
  var k = ABn.mul(P.sub(A));
  if (k<0) return A;
  if (k>AB.length()) return B;
  return A.add(ABn.scaled(k));
}

/// Calculates the intersection point between a ray and a line segment.
/** The ray is passed as origin and direction vector, the line segment
 * as its two end points A and B. If an intersection is found, the method
 * writes it to the passed intersection point and returns true. If no
 * intersection is found, the method returns false.
 *
 * If there is more than one intersection point (might happen when ray and line
 * segment are parallel), the first intersection point is returned.
 *
 * In order not to miss an intersection with the ray and one of the end points
 * of AB, the method will regard very close misses (which are closer than
 * margin) as collisions, too.
 * 
 * Params:
 *   R: start of ray (Point)
 *   v: direction vector of ray (Point)
 *   A, B: start and end point of line segment (Point)
 *   intersection: intersection point is written into this (Point)!!
 *   margin: if ray misses the segment by 'margin' or less, it is regarded as hit (default is Point.EPS)
 */
Point.intersect_ray_with_segment = function(R, v, A, B, intersection, margin) {
  // if there is an intersection, it is at A+l*(B-A)
  // where l = (A-R) x v / (v x (B-A))
  // with a x b ... cross product (applied to 2D) between a and b
  if (typeof(intersection) == 'undefined') var intersection = new Point();
  if (typeof(margin) == 'undefined') var margin = Point.EPS;
  // so we start with calculating the divisor
  var AB = B.sub(A);
  var divisor = v.cross(AB);
  if (Math.abs(divisor) > Point.EPS) { 
    // divisor is not zero -- no parallel lines!
    // now calculate l
    var l = (A.sub(R)).cross(v) / divisor;
    // check if we have an intersection
    if (l < -margin || l-1. > margin) return false;
    var hit = A.add(AB.scaled(l));
    intersection.x = hit.x; intersection.y = hit.y;
  } else {
    // devisor is zero so first check check for A!=B and v!=0
    if (v.length2() < Point.EPS || AB.length2() < Point.EPS)
      return false;
    // okay, A!=B and v!=0 so this means the lines are parallel
    // we project R onto AB to get its relative position k: R' = A + k*(B-A)
    var k = R.sub(A).mul(AB) / AB.mul(AB);
    // now first check, whether v and AB are colinear    
    if (A.add(AB.scaled(k)).dist(R) > Point.EPS) return false;
    // they are colinear so there might be an intersection, but it depends where
    // R is relative to AB
    if (k < -margin) { intersection.x = A.x; intersection.y = A.y}
    else if (k - 1. > margin) { intersection.x = B.x; intersection.y = B.y}
    else {intersection.x = R.x; intersection.y = R.y}
  }
  // direction check
  if (intersection.sub(R).mul(v) >= 0.) return true;
  else return false;
}

if (typeof(exports) != 'undefined') { exports.Point = Point }
