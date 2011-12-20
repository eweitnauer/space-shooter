var measure_duration = function(fn) {
  var t0 = Date.now()
  fn()
  return Date.now()-t0
}

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
  this.animation = {};
  return;

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

preloaded_collision_lines='[{"A":{"x":136.91665649414062,"y":507.1805419921875},"B":{"x":173.02776718139648,"y":535.6527614593506}},{"A":{"x":173.02776718139648,"y":535.6527614593506},"B":{"x":175.11110711097717,"y":555.7916507720947}},{"A":{"x":175.11110711097717,"y":555.7916507720947},"B":{"x":247.3333284854889,"y":598.1527614593506}},{"A":{"x":247.3333284854889,"y":598.1527614593506},"B":{"x":272.3333284854889,"y":579.4027614593506}},{"A":{"x":272.3333284854889,"y":579.4027614593506},"B":{"x":217.6272394657135,"y":555.4208507537842}},{"A":{"x":217.6272394657135,"y":555.4208507537842},"B":{"x":312.08333230018616,"y":545.3142509460449}},{"A":{"x":312.08333230018616,"y":545.3142509460449},"B":{"x":327.62402272224426,"y":612.4731788635254}},{"A":{"x":327.62402272224426,"y":612.4731788635254},"B":{"x":297.3333332538605,"y":593.2916488647461}},{"A":{"x":297.3333332538605,"y":593.2916488647461},"B":{"x":280.6666634082794,"y":621.7638683319092}},{"A":{"x":280.6666634082794,"y":621.7638683319092},"B":{"x":325.80555272102356,"y":662.7360973358154}},{"A":{"x":325.80555272102356,"y":662.7360973358154},"B":{"x":374.4166634082794,"y":659.9583172798157}},{"A":{"x":374.4166634082794,"y":659.9583172798157},"B":{"x":405.6666634082794,"y":637.0416474342346}},{"A":{"x":405.6666634082794,"y":637.0416474342346},"B":{"x":457.05555272102356,"y":639.8194274902344}},{"A":{"x":457.05555272102356,"y":639.8194274902344},"B":{"x":482.7500030994415,"y":537.7360992431641}},{"A":{"x":482.7500030994415,"y":537.7360992431641},"B":{"x":445.94443440437317,"y":513.4305400848389}},{"A":{"x":445.94443440437317,"y":513.4305400848389},"B":{"x":500.1111137866974,"y":512.041650056839}},{"A":{"x":500.1111137866974,"y":512.041650056839},"B":{"x":494.5555536746979,"y":478.0138714313507}},{"A":{"x":494.5555536746979,"y":478.0138714313507},"B":{"x":452.8888819217682,"y":457.18054127693176}},{"A":{"x":452.8888819217682,"y":457.18054127693176},"B":{"x":668.5374567508698,"y":446.6559908390045}},{"A":{"x":668.5374567508698,"y":446.6559908390045},"B":{"x":636.6401560306549,"y":519.0595934391022}},{"A":{"x":636.6401560306549,"y":519.0595934391022},"B":{"x":641.8312962055206,"y":621.3187639713287}},{"A":{"x":641.8312962055206,"y":621.3187639713287},"B":{"x":703.5969173908234,"y":650.977703332901}},{"A":{"x":703.5969173908234,"y":650.977703332901},"B":{"x":714.0471470355988,"y":625.8226625919342}},{"A":{"x":714.0471470355988,"y":625.8226625919342},"B":{"x":720.7350471019745,"y":641.2083323001862}},{"A":{"x":720.7350471019745,"y":641.2083323001862},"B":{"x":775.4954879283905,"y":642.9344522953033}},{"A":{"x":775.4954879283905,"y":642.9344522953033},"B":{"x":740.928299665451,"y":577.3194315433502}},{"A":{"x":740.928299665451,"y":577.3194315433502},"B":{"x":839.2021415233612,"y":577.6430815458298}},{"A":{"x":839.2021415233612,"y":577.6430815458298},"B":{"x":825.1111514568329,"y":482.1805418729782}},{"A":{"x":825.1111514568329,"y":482.1805418729782},"B":{"x":793.8611114025116,"y":452.31943118572235}},{"A":{"x":793.8611114025116,"y":452.31943118572235},"B":{"x":790.388881444931,"y":430.09721171855927}},{"A":{"x":790.388881444931,"y":430.09721171855927},"B":{"x":848.7222516536713,"y":428.7083216905594}},{"A":{"x":848.7222516536713,"y":428.7083216905594},"B":{"x":895.9444425106049,"y":413.4305421113968}},{"A":{"x":895.9444425106049,"y":413.4305421113968},"B":{"x":895.2499424815178,"y":378.70832073688507}},{"A":{"x":895.2499424815178,"y":378.70832073688507},"B":{"x":856.3611409068108,"y":345.37498104572296}},{"A":{"x":856.3611409068108,"y":345.37498104572296},"B":{"x":971.7222477793694,"y":347.45832097530365}},{"A":{"x":971.7222477793694,"y":347.45832097530365},"B":{"x":990.0426480174065,"y":380.5758899450302}},{"A":{"x":990.0426480174065,"y":380.5758899450302},"B":{"x":985.9592482447624,"y":131.27033269405365}},{"A":{"x":985.9592482447624,"y":131.27033269405365},"B":{"x":143.16664570569992,"y":109.26387250423431}},{"A":{"x":143.16664570569992,"y":109.26387250423431},"B":{"x":136.91665649414062,"y":507.1805419921875}}]'
