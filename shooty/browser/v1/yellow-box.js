vec2distance = function(x1,y1, x2, y2){
  var dx = x1-x2;
  var dy = y1-y2;
  return Math.sqrt( dx*dx + dy*dy );
}

energyLineTo = function (ctx,x, y, toX, toY, minDist, maxStepLength, approachFactor) {
  ctx.moveTo(x, y);

  var up = false;
  var MAX_STEPS = 200;
  var step = 0;
  while(++step < MAX_STEPS && vec2distance(x,y,toX,toY) > minDist){
    var a = Math.atan2(toY - y, toX - x) + (up ? 1 : -1) + Math.PI/2; // orthogonal to the actual dir
    a += 0.1 * (up ? -1 : +1) * Math.random()*(Math.PI/2);
    up = !up;
    var d = Math.random() * maxStepLength; // 15
    var nx = x+Math.sin(a) * d;
    var ny = y-Math.cos(a) * d;
    nx += (toX-nx)*approachFactor; // 0.01;
    ny += (toY-ny)*approachFactor;
    
    ctx.lineTo(nx,ny);
    x = nx;
    y = ny;
  }
  ctx.lineTo(toX,toY);
}

dashedLineTo = function (ctx,fromX, fromY, toX, toY, pattern) {
  var lt = function (a, b) { return a <= b; };
  var gt = function (a, b) { return a >= b; };
  var capmin = function (a, b) { return Math.min(a, b); };
  var capmax = function (a, b) { return Math.max(a, b); };
  var checkX = { thereYet: gt, cap: capmin };
  var checkY = { thereYet: gt, cap: capmin };
  
  if (fromY - toY > 0) {
    checkY.thereYet = lt;
    checkY.cap = capmax;
  }
  if (fromX - toX > 0) {
    checkX.thereYet = lt;
    checkX.cap = capmax;
  }
  
  ctx.moveTo(fromX, fromY);
  var offsetX = fromX;
  var offsetY = fromY;
  var idx = 0, dash = true;
  while (!(checkX.thereYet(offsetX, toX) && checkY.thereYet(offsetY, toY))) {
    var ang = Math.atan2(toY - fromY, toX - fromX);
    var len = pattern[idx];
    
    offsetX = checkX.cap(toX, offsetX + (Math.cos(ang) * len));
    offsetY = checkY.cap(toY, offsetY + (Math.sin(ang) * len));
    
    if (dash) ctx.lineTo(offsetX, offsetY);
    else ctx.moveTo(offsetX, offsetY);
    idx = (idx + 1) % pattern.length;
    dash = !dash;
  }
}


SmallYellowBox = function(parent,x,y){
  this.parent_yellow_box = parent;
  this.type = 'alien_ship';
  this.is_small_yellow_box = true;
  this.v_max = 0.3;
  this.trun_speed = 0.01;
  this.acceleration = 0.2;
  this.points = 5;
  this.coins = 5;
  this.sprite_name = 'alien-small-yellow-box';
  this.explosion_size = 'M';
  this.collision_radius = 10;
  this.restitution = 0.5;
  this.mass = 2;
  this.max_energy = 20;

  this.init_sprite();
  this.spawn();
  this.x = x;
  this.y = y;

  this.list_element = null;
  
  this.shoot_interval = 3200;
  this.last_shoot_time = Animation.time;
  this.shot_level = 4;
  this.shot_speed = 2;
  this.shot_energy = 5;
  this.shot_max_dist = 100;
  this.shoot_interval_when_unwired = 500;
}

SmallYellowBox.prototype = new Alien();
SmallYellowBox.prototype.constructor = SmallYellowBox;

SmallYellowBox.prototype.step = function(){
  if(this.parent_yellow_box == null){
    this.vy += 0.1;
    this.vx += 0.01;
    this.x += this.vx;
    this.y += this.vy;
    this.rot += 0.2;
    this.shoot_interval = this.shoot_interval_when_unwired;
    this.shoot_behaviour();
  }else{
    this.think();
    this.adjust_speed();
    this.x += this.vx;
    this.y += this.vy;
    this.adjust_rot();
  }
}

SmallYellowBox.prototype.shoot = function(){
  for(var i=0;i<4;++i){
    var r = (this.parent_yellow_box == null ? Math.random() * Math.PI*2 :
             this.rot + Math.PI/4 + i * Math.PI/2);
    var s = new Shot(this.shot_level,null,
                     this.x+Math.sin(r)*10,
                     this.y-Math.cos(r)*10,
                     this.vx,this.vy, this.shot_speed,r,
                     this.shot_energy,this.shot_max_dist);
    s.scale = 0.7;
    if(this.parent_yellow_box == null) break;
  }
}

SmallYellowBox.prototype.shoot_behaviour = function(){
  if( (Animation.time - this.last_shoot_time) > this.shoot_interval){
    this.last_shoot_time = Animation.time;
    this.shoot();
  } 
}

SmallYellowBox.prototype.think = function(){
  this.shoot_behaviour();
  this.sense(this.sensor_range);
  if (this.avoid_obstacles_behavior(this.sensor_range)) return;
  this.random_flight_behavior(); 
}

/// Random flight with preferred turning direction.
SmallYellowBox.prototype.random_flight_behavior = function() {
  if (Math.random() < 0.04) {
    this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
  }
  if (Math.random() < 0.2) {
    if (this.preferred_dir == 'left') this.turn_left();
    else this.turn_right();
  }
}

SmallYellowBox.prototype.explode = function(){
  this.list_element.remove();
  var expl = new Explosion(this.x, this.y, this.explosion_size);
  expl.shockwave({dvel: 2, vel_r: 60, damage: 20, damage_r1: 10, damage_r2: 20});

  var blast = new Explosion(this.x, this.y, 'blast');
  blast.scale = 1.5;
  blast.rot = Math.random()*Math.M_PI*2;
  blast.alpha_decay = 0.15;
}


///** Classical U.F.O. type of alien ship. It moves on a horizontal line at the
//    top of the screen and releases mines. */
YellowBox = function(version) {
  this.is_yellow_box = true;
  if(version == null){
    version = "large";
  }
  this.version = version;
  this.type = 'alien_ship'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensors = [];        // an array of sensors results
  this.sensor_range = 60;   // max. sensor range
  this.v_max = 1.0;         // maximum speed
  this.turn_speed = 0.1;    // turning speed
  this.acceleration = 0.02; // acceleration
  this.points = 100;        // points the players get on destruction
  this.coins = 100;         // coins the players get on destruction
  
  this.sprite_name = 'alien-yellow-box';
  this.explosion_size = 'XXL';
  this.collision_radius = 16;        // collision radius for physics
  this.restitution = 0.9;            // restitution for collision
  this.mass = 4;                     // mass of ship
  this.max_energy = 100;
  
  this.max_mine_count = 5;     // number of mines per production cycle
  this.release_rate = 3000;    // time between releasing two mines
  this.production_time = 100; // time needed to procude max_mine_count mines
  
  this.init_sprite();
  this.spawn();
  this.my_spawn();
  
  // todo use this!  this.small_boxes = new LinkedList();
  this.small_boxes = new LinkedList();
}

YellowBox.prototype = new Alien();
YellowBox.prototype.constructor = YellowBox;

// this is just copied from the ufo
YellowBox.prototype.smoke = Ufo.prototype.smoke;
YellowBox.prototype.step = Ufo.prototype.step;
YellowBox.prototype.adjust_speed = Ufo.prototype.adjust_speed;
YellowBox.prototype.think = Ufo.prototype.think;
YellowBox.prototype.drop_mines_behavior = Ufo.prototype.drop_mines_behavior;
YellowBox.prototype.my_spawn = Ufo.prototype.my_spawn;

YellowBox.prototype.release_mine = function() {
  var s = new SmallYellowBox(this,this.x,this.y);
  this.small_boxes.push(s);
  s.list_element = this.small_boxes.tail;

  this.production_time = 10000;
}

YellowBox.prototype.explode = function(){
  var expl = new Explosion(this.x, this.y, this.explosion_size);
  expl.shockwave(this.shockwave);
  this.small_boxes.forEach(function(box,el){
    box.parent_yellow_box = null;
  });
}


YellowBox.prototype.extra_draw = function(ctx){
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.lineWidth = 0.5;

  //var xLast = this.x + Math.sin(this.rot)*14;
  //var yLast = this.y - Math.cos(this.rot)*14;
  //var pattern = [Math.random()*4+2,Math.random()*4+2,Math.random()*4+2,Math.random()*4+2];
  var strokeStyles = ['rgb(255,200,0)','rgb(255,100,0)'];
  //var strokeStyles = ['rgb(0,0,0)'];
  var self = this;
  
  for(var i=0;i<strokeStyles.length;++i){
    var xLast = this.x + Math.sin(this.rot)*16;
    var yLast = this.y - Math.cos(this.rot)*16;
    ctx.strokeStyle = strokeStyles[i];
    ctx.beginPath();
    ctx.moveTo(xLast, yLast);
    
    this.small_boxes.forEachReverse(function(data,el){
      energyLineTo(ctx,xLast,yLast,data.x, data.y,15,15,0.001);
      xLast = data.x;
      yLast = data.y;
    });
    ctx.stroke();
  }
  
  ctx.restore();
}


