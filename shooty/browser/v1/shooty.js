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

preloaded_collision_lines='[{"A":{"x":323.6111145019531,"y":525},"B":{"x":345.13889503479004,"y":545.1388893127441}},{"A":{"x":345.13889503479004,"y":545.1388893127441},"B":{"x":359.722225189209,"y":553.4722194671631}},{"A":{"x":359.722225189209,"y":553.4722194671631},"B":{"x":361.8055651187897,"y":573.6111087799072}},{"A":{"x":361.8055651187897,"y":573.6111087799072},"B":{"x":397.22222542762756,"y":588.1944389343262}},{"A":{"x":397.22222542762756,"y":588.1944389343262},"B":{"x":409.0277855396271,"y":605.5555591583252}},{"A":{"x":409.0277855396271,"y":605.5555591583252},"B":{"x":434.0277855396271,"y":615.9722194671631}},{"A":{"x":434.0277855396271,"y":615.9722194671631},"B":{"x":459.0277855396271,"y":597.2222194671631}},{"A":{"x":459.0277855396271,"y":597.2222194671631},"B":{"x":438.19444584846497,"y":586.8055591583252}},{"A":{"x":438.19444584846497,"y":586.8055591583252},"B":{"x":408.3333351612091,"y":580.5555591583252}},{"A":{"x":408.3333351612091,"y":580.5555591583252},"B":{"x":408.3333351612091,"y":570.8333292007446}},{"A":{"x":408.3333351612091,"y":570.8333292007446},"B":{"x":487.5000069141388,"y":561.1111087799072}},{"A":{"x":487.5000069141388,"y":561.1111087799072},"B":{"x":502.7777864933014,"y":568.7499985694885}},{"A":{"x":502.7777864933014,"y":568.7499985694885},"B":{"x":521.5277864933014,"y":627.0833268165588}},{"A":{"x":521.5277864933014,"y":627.0833268165588},"B":{"x":511.11111664772034,"y":631.9444370269775}},{"A":{"x":511.11111664772034,"y":631.9444370269775},"B":{"x":484.0277864933014,"y":611.1111068725586}},{"A":{"x":484.0277864933014,"y":611.1111068725586},"B":{"x":467.36111664772034,"y":639.5833263397217}},{"A":{"x":467.36111664772034,"y":639.5833263397217},"B":{"x":512.5000059604645,"y":680.5555553436279}},{"A":{"x":512.5000059604645,"y":680.5555553436279},"B":{"x":561.1111166477203,"y":677.7777752876282}},{"A":{"x":561.1111166477203,"y":677.7777752876282},"B":{"x":592.3611166477203,"y":654.8611054420471}},{"A":{"x":592.3611166477203,"y":654.8611054420471},"B":{"x":643.75,"y":657.638916015625}},{"A":{"x":643.75,"y":657.638916015625},"B":{"x":669.4444580078125,"y":555.5555419921875}},{"A":{"x":669.4444580078125,"y":555.5555419921875},"B":{"x":632.638916015625,"y":531.25}},{"A":{"x":632.638916015625,"y":531.25},"B":{"x":686.8055419921875,"y":529.861083984375}},{"A":{"x":686.8055419921875,"y":529.861083984375},"B":{"x":681.25,"y":495.8333435058594}},{"A":{"x":681.25,"y":495.8333435058594},"B":{"x":639.5833129882812,"y":475}},{"A":{"x":639.5833129882812,"y":475},"B":{"x":857.6388702392578,"y":465.2777795791626}},{"A":{"x":857.6388702392578,"y":465.2777795791626},"B":{"x":824.3055419921875,"y":541.666672706604}},{"A":{"x":824.3055419921875,"y":541.666672706604},"B":{"x":829.8610920906067,"y":563.1944417953491}},{"A":{"x":829.8610920906067,"y":563.1944417953491},"B":{"x":838.1944317817688,"y":567.3611116409302}},{"A":{"x":838.1944317817688,"y":567.3611116409302},"B":{"x":830.5555419921875,"y":603.472222328186}},{"A":{"x":830.5555419921875,"y":603.472222328186},"B":{"x":842.3610916137695,"y":609.722222328186}},{"A":{"x":842.3610916137695,"y":609.722222328186},"B":{"x":829.8610916137695,"y":640.2777814865112}},{"A":{"x":829.8610916137695,"y":640.2777814865112},"B":{"x":834.0277614593506,"y":645.1388916969299}},{"A":{"x":834.0277614593506,"y":645.1388916969299},"B":{"x":869.4444332122803,"y":652.7777814865112}},{"A":{"x":869.4444332122803,"y":652.7777814865112},"B":{"x":879.8610935211182,"y":673.6111116409302}},{"A":{"x":879.8610935211182,"y":673.6111116409302},"B":{"x":899.3055438995361,"y":665.2777814865112}},{"A":{"x":899.3055438995361,"y":665.2777814865112},"B":{"x":899.3055438995361,"y":645.1388921737671}},{"A":{"x":899.3055438995361,"y":645.1388921737671},"B":{"x":905.5555438995361,"y":644.444442152977}},{"A":{"x":905.5555438995361,"y":644.444442152977},"B":{"x":910.4166541099548,"y":659.0277818441391}},{"A":{"x":910.4166541099548,"y":659.0277818441391},"B":{"x":945.1388754844666,"y":659.0277818441391}},{"A":{"x":945.1388754844666,"y":659.0277818441391},"B":{"x":954.1666550636292,"y":647.9166721105576}},{"A":{"x":954.1666550636292,"y":647.9166721105576},"B":{"x":944.4444580078125,"y":612.5}},{"A":{"x":944.4444580078125,"y":612.5},"B":{"x":923.611083984375,"y":595.138916015625}},{"A":{"x":923.611083984375,"y":595.138916015625},"B":{"x":1034.72216796875,"y":593.0555419921875},"mass":100,"vx":0,"vy":0,"x":1026.9812827696896,"y":593.2006864599024,"restitution":0.4},{"A":{"x":1034.72216796875,"y":593.0555419921875},"B":{"x":1011.8056030273438,"y":500},"mass":100,"vx":0,"vy":0,"x":1032.0719414786327,"y":582.2939700432295,"restitution":0.4},{"A":{"x":1011.8056030273438,"y":500},"B":{"x":980.5555629730225,"y":470.13888931274414}},{"A":{"x":980.5555629730225,"y":470.13888931274414},"B":{"x":977.0833330154419,"y":447.91666984558105}},{"A":{"x":977.0833330154419,"y":447.91666984558105},"B":{"x":1035.4167032241821,"y":446.5277798175812}},{"A":{"x":1035.4167032241821,"y":446.5277798175812},"B":{"x":1082.6389017105103,"y":431.2500002384186}},{"A":{"x":1082.6389017105103,"y":431.2500002384186},"B":{"x":1081.9444016814232,"y":396.52777886390686}},{"A":{"x":1081.9444016814232,"y":396.52777886390686},"B":{"x":1043.0556001067162,"y":363.19443917274475}},{"A":{"x":1043.0556001067162,"y":363.19443917274475},"B":{"x":1160.4166993498802,"y":365.27777910232544}},{"A":{"x":1160.4166993498802,"y":365.27777910232544},"B":{"x":1161.8055993914604,"y":398.61110734939575}},{"A":{"x":1161.8055993914604,"y":398.61110734939575},"B":{"x":1171.5277997851372,"y":399.99999737739563}},{"A":{"x":1171.5277997851372,"y":399.99999737739563},"B":{"x":1177.7777997851372,"y":227.77778363227844}},{"A":{"x":1177.7777997851372,"y":227.77778363227844},"B":{"x":1169.4444000124931,"y":150.69444012641907}},{"A":{"x":1169.4444000124931,"y":150.69444012641907},"B":{"x":1138.1944000124931,"y":150.0000001192093}},{"A":{"x":1138.1944000124931,"y":150.0000001192093},"B":{"x":1107.6388999819756,"y":142.361110329628}},{"A":{"x":1107.6388999819756,"y":142.361110329628},"B":{"x":329.8611289858818,"y":127.0833307504654}},{"A":{"x":329.8611289858818,"y":127.0833307504654},"B":{"x":323.6111145019531,"y":525}}]'
