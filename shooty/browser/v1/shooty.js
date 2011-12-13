/// size must be one of 'L', 'M', 'S'.
var Explosion = function(x, y, size) {
  this.init_sprite(size);
  this.x = x; this.y = y; this.rot = Math.random()*Math.PI*2;
}

/// Pass as type on of 'sploing', 'ship', 'green', 'L', 'M', 'S'.
Explosion.prototype.init_sprite = function(type) {
  if (type == 'sploing') {
    var sprite = new Sprite(80, (Math.random()<0.5)?'explosion-sploing-a':'explosion-sploing-b');
  } else {
    var sprite = new Sprite(80, 'explosion-'+type);
  }
  sprite.rot = Math.random()*Math.PI*2;
  sprite.animation.loop = false;
  jQuery.extend(this, sprite);
  Game.main_sprite.child_sprites.push(this);
}

/// Simulates an instantanious shockwave around the explosion, that damages and
/// pushes away any object close enough.
/// Parameters are passed as an args object:
///   args.damage    ... max. damage for affected objects
///   args.damage_r1 ... if obj. is closer than this, deal max. damage
///   args.damage_r2 ... if obj. is farer than this, deal no damage
///   args.dvel      ... max. delta velocity for affected objects
///   args.vel_r     ... if obj. is farer than this, don't change vel.
/// If the damage or the velocity attributes are not set in the args object, the
/// respective effect is not applied to the near objects.
Explosion.prototype.shockwave = function(args) {
  if (!args.damage && !args.dvel) return;
  var self = this;
  var apply_to = function(obj) {
    if (self === obj) return;
    if (obj.destroyed) return;
    var d = inner_dist(obj, self);
    if (d<0) d=0;
    if (args.dvel && d <= args.vel_r) {
      var dir = new Point(obj.x-self.x, obj.y-self.y);
      dir.normalize();
      var l = args.dvel * (args.vel_r-d) / args.vel_r;
      obj.vx += dir.x*l; obj.vy += dir.y*l;
    }
    if (args.damage && 'hit' in obj && d <= args.damage_r2) {
      if (d<args.damage_r1) obj.hit(args.damage);
      else obj.hit(args.damage * (1 - (d-args.damage_r1) / 
                                      (args.damage_r2-args.damage_r1)));
    }
  }
  // iterate over all movable objects (ships, aliens, smokes)
  Game.forEachMovableObject(apply_to);
}

var Smoke = function(x,y,type,parent_sprite){
  this.init_sprite(type, parent_sprite);
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

/// Pass as type one of '0', '1', '2', '3', '4', 'rocket-S', 'rocket-XS', 
Smoke.prototype.init_sprite = function(type, parent_sprite) {
  var sprite = new Sprite(100, 'smoke-'+type);
  sprite.animation.loop = false;
  sprite.rot = Math.random()*Math.PI*2;
  jQuery.extend(this, sprite);
  if (parent_sprite) {
    parent_sprite.child_sprites.push(this);
    this.draw_in_front_of_parent = false;
  } else Game.main_sprite.child_sprites.push(this);
}

var Shot = function(level,shooter,x,y,vx,vy,v,rot,energy,maxDist,extra_step_func) {
  this.level = level;
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
  this.maxDist = maxDist;
  
  this.extra_step_func = extra_step_func;
  
  this.step = function(){
    if(this.level == 6){ // this is no player shot
      if(Math.random() > 0.5){
        var s = new Smoke(this.x+(Math.random()-.5)*5, 
                          this.y+(Math.random()-.5)*5, 
                          'spark-0');
        s.alpha = 0.8;
        s.scale = 0.4+Math.random()*0.6;
        s.alpha_decay = 0.2+Math.random() * 0.4;
      }
      
    }else if(this.level == 4){
      if(Math.random() > 0.2){
        var s = new Smoke(this.x+(Math.random()-.5)*5, 
                          this.y+(Math.random()-.5)*5, 
                          Math.random() > 0.2 ? 'spark-0' : 'spark-1');
        s.alpha = 0.8;
        s.scale = 0.4+Math.random()*0.6;
        s.alpha_decay = 0.2+Math.random() * 0.4;
      }
    }else if(this.level == 5){
      var r = Math.random();
      if(r > 0.8){
        var s = new Smoke(this.x-this.vx, this.y-this.vy, "rocket-XS");
        s.scale = 0.3 + Math.random() * 0.5;
        s.rot = Math.random() * 2*Math.PI;
        s.alpha = 0.8 + Math.random() *  0.2;
        s.alpha_decay = 0.05 + Math.random() * 0.1;
      }else if(r > 0.3){
        var s = new Smoke(this.x+(Math.random()-.5)*5, 
                          this.y+(Math.random()-.5)*5, 
                          'spark-1');
        s.alpha = 0.8;
        s.scale = 0.4+Math.random()*0.6;
        s.alpha_decay = 0.2+Math.random() * 0.4;
      }
   
    }
    
    this.x += this.vx;
    this.y += this.vy;
    var dx = this.x-this.initx;
    var dy = this.y-this.inity;
    var flownDist = Math.sqrt(dx*dx+dy*dy);
    if (flownDist > this.maxDist) this.kill();
    
    if(this.extra_step_func != null){
      this.extra_step_func(this);
    }
  }
  this.kill = function() {
    this.display = false;
    this.animation.finished = true;
  }
};

Shot.prototype.init_sprite = function() {
  var sprite = new Sprite(80, 'bullet-'+this.level);
  jQuery.extend(this, sprite);
  Game.main_sprite.child_sprites.push(this);
  Game.shots.push(this);
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

