/// size must be one of 'L', 'M', 'S'.
var Explosion = function(x, y, size) {
  this.init_sprite(size);
  this.x = x; this.y = y; this.rot = Math.random()*Math.PI*2;
}

Explosion.prototype.init_sprite = function(size) {
  if (size == 'XXL') var sprite = new Sprite(80, 'huge_explosion');
  else if (size == 'XL') var sprite = new Sprite(80, 'big_explosion');
  else if (size == 'L') var sprite = new Sprite(80, 'med_explosion');
  else if (size == 'M') var sprite = new Sprite(80, 'small_explosion');
  else if (size == 'S') var sprite = new Sprite(80, (Math.random()<0.5)?'sploing_a':'sploing_b');
  else var sprite = new Sprite();
  sprite.animation.loop = false;
  jQuery.extend(this, sprite);
  Game.main_sprite.child_sprites.push(this);
}

Explosion.prototype.shockwave = function(dv, r1, damage, r2, inner_radius) {
  var self = this;
  var apply_to = function(obj) {
    var d = dist(obj, self);
    if (d==0) return;
    if ('collision_radius' in obj) d -= obj.collision_radius;
    d -= inner_radius;
    if (d<0) d = 0;
    if (d <= r1) {
      var dir = new Point(obj.x-self.x, obj.y-self.y);
      dir.normalize();
      var l = dv * (r1-d) / r1;
      obj.vx = dir.x*l; obj.vy = dir.y*l;
    }
    if (d <= r2) {
      obj.hit(damage*(r2-d)/r2);
    }
  }
  // iterate aliens
  Game.aliens.forEach(function(alien) {
    apply_to(alien);
  });
  // iterate ships
  Game.forEachActiveShip(function(ship) {
    apply_to(ship);
  });    
}

var Smoke = function(x,y,img){
  var img = typeof(img) != 'undefined' ? img : 'lighter-smoke-large-colored';
  this.init_sprite(img);
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.step = function(){
    this.vx += Game.wind_vx; 
    this.vy += Game.wind_vy;
    this.x += this.vx;
    this.y += this.vy;
  }
  Game.smokes.push(this);
};

Smoke.prototype.init_sprite = function(img) {
  var sprite = new Sprite(100, img);
  sprite.animation.loop = false;
  jQuery.extend(this, sprite);
  Game.main_sprite.child_sprites.push(this);
}

var Shot = function(shooter,x,y,vx,vy,v,rot,energy) {
  this.init_sprite();
  this.energy = energy;
  this.collision_radius = 4;
  this.restitution = 0.9;
  this.mass = 0.02;
  this.shooter = shooter;
  this.initx = x;
  this.inity = y;
  this.x = x;
  this.y = y;
  this.vx = v *  Math.sin(rot) + vx;
  this.vy = v * -Math.cos(rot) + vy;
  this.rot = rot;
  this.maxDist2 = 300*300;
  this.step = function(){
    this.x += this.vx;
    this.y += this.vy;
    var dx = this.x-this.initx;
    var dy = this.y-this.inity;
    if (dx*dx+dy*dy > this.maxDist2) this.kill();
  }
  this.kill = function() {
    this.display = false;
    this.animation.finished = true;
  }
};

Shot.prototype.init_sprite = function() {
  var sprite = new Sprite(80, 'bullet');
  jQuery.extend(this, sprite);
  Game.main_sprite.child_sprites.push(this);
}

// ajax
ajaxGetUrl = function(url) {
  var AJAX;
  if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
  else{AJAX=new ActiveXObject('Microsoft.XMLHTTP');}
  if(AJAX){
    AJAX.open('GET',url,false);
    AJAX.send(null);
    return AJAX.responseText;
  }
  return null;
}

// parse xml
parseXml = function(xml) {
  if (window.DOMParser) {
    var parser = new DOMParser();
    return parser.parseFromString(xml, 'text/xml');
  } else {
    xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
    var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
    xmlDoc.async = 'false';
    xmlDoc.loadXML(xml); 
    return xmlDoc;
  }
}

function load_collision_data_from_svg(xml) {
  var lines = [];
  // read content into DOM tree
  var svg = parseXml(xml);
  if (!svg) { console.log('Error parsing ', content); return; }
  
  var root = svg.documentElement;
  var nsResolver = svg.createNSResolver(root);
      
  // read the collision paths
  var paths = svg.evaluate('//svg:path[@collision-object]',
                           root, nsResolver, 0, null);
  var path;
  while (path = paths.iterateNext()) {
    var poly = Polygon.fromPath(path);
    var N = poly.pts.length;
    for (var i=0; i<N-1; i++) {
      lines.push({A: poly.pts[i].clone(), B: poly.pts[i+1].clone()});
    }
    if (poly.closed && N > 2) lines.push({A: poly.pts[N-1].clone(), B: poly.pts[0].clone()}); 
  }
  return lines;
}

/// loads all svg path elements from the svg file in the passed url, extracts
/// their straight line segments and returns them in an array which looks like
/// [{A:Point, B:Point}, ...].
function load_collision_data_from_url(url) {
  // load file with ajax request
  var content = ajaxGetUrl(url);
  if (!content) { console.log('Error loading ', url); return; }
  return load_collision_data_from_svg(content);
}

Math.clipped = function(x, min, max) {
  return (x<min) ? min : ((x>max) ? max : x);
}

Math.sign = function(x) {
  return (x<0) ? -1 : ((x>0) ? 1 : 0);
}

Math.randomSign = function() {
  return Math.random()<0.5 ? 1 : -1;
}

/// Returns the passed angle projected into the interval [-Pi, Pi] by adding or
/// subtracting multiples of 2*Pi.
norm_rotation = function(rot) {
  var r = rot % (Math.PI*2);
  if (r < -Math.PI) r += 2*Math.PI;  
  else if (r > Math.PI) r -= 2*Math.PI;  
  return r;
}

/// Returns the passed angle projected into the interval [0, 2*Pi] by adding or
/// subtracting multiples of 2*Pi.
norm_rotation2 = function(rot) {
  var r = rot % (Math.PI*2);
  if (r < 0) r += 2*Math.PI;  
  return r;
}

