/// Written by Erik Weitnauer, Christof Elbrechter and Rene Tuennermann.
/// eweitnauer@gmail.com

var Ship = function(session_code) {
  this.type = 'ship';
  
//  this.shield = new Shield(this);
  this.init_sprite();
  this.score_sprite = this.createScoreSprite();
  this.player_name = 'player';
  this.code = session_code;
  this.id = Ship.id++;
  this.x = 320;
  this.y = 250;
  this.rot = 0;
  this.vx = 0;
  this.vy = 0;
  this.collision_radius = 12;
  this.restitution = 0.90;
  this.mass = 1;
  this.last_shot_time = 0;
  this.shot_delay = 250; // in ms
  this.energy = 500;
  this.last_time = 0;
  this.session_code = session_code;
  this.steer_data = { shot:false, accel:false, pitch:0 };
  this.points = 0;
  this.destroyed = false;
  this.state = 'flying'; // 'opening, charging, closing, flying'
  this.lives = 3;
  this.respawn_delay = 3000;
  this.extras = new Extras();
  
  this.max_energy = 100;
  this.acceleration = 0.1;
  this.shot_speed = 10;
  this.shot_energy = 60;
  this.shot_max_dist = 270;
  this.num_shots = 1;
  this.shot_angle = 0.05;
  this.shot_level = 0;
  
  this.rocket_level = 0; // todo
  this.heal_per_sec = 15;
  this.rotation_speed = 1;

  this.rocket_warhead_energy = 50;
  this.rocket_mass = 0.5;
  this.rocket_turn_speed = 0.0025;
  this.rocket_sensor_range = 100;
  this.rocket_count_max = 0;
  this.rocket_scale = 0.4;
  this.curr_rocket_count = 0;

  this.smoke_interval = 200;   // one puff every x ms
};




Ship.prototype.update_from_extra = function(name){
  var extraLevel = this.extras.levels[name];
  switch(name){
  case 'health':
    this.energy = this.max_energy;
    break;
  case 'acceleration':
    this.acceleration = 0.1 + extraLevel * 0.04;
    break;
  case 'bullet-speed':
    this.shot_speed = 10 + extraLevel * 2;
    break;
  case 'life':
    Game.lives++;
    break;
  case 'shield':
    this.max_energy *= 2;
    this.energy = this.max_energy;
    break;
  case 'shot':
    this.num_shots = 1+extraLevel;
    break;
  case 'shot-angle':
    this.shot_angle *= 1.2;
    break;
  case 'shot-length':
    this.shot_max_dist = 250 + 50*extraLevel;
    break;
  case 'shot-steangth':
    this.shot_energy = 10 + Math.pow(2,extraLevel);
    this.shot_level++;
    break;
  case 'recharge-speed':
    this.heal_per_sec = (this.heal_per_sec + 5)*1.5;
    break;
  case 'rotation-speed':
    this.rotation_speed = (this.rotation_speed+0.1)*1.05;
    break;
  case 'rocket':
    this.rocket_warhead_energy = (this.rocket_warhead_energy+50)*1.2;
    this.rocket_mass *= 1.1;
    this.rocket_turn_speed *= 1.1;
    this.rocket_sensor_range *= 1.2;
    this.rocket_scale *= 1.1;
    this.rocket_count_max ++;

    break;

  }
}

Ship.prototype.steer = function(data) {
  if (!data) return;
  
  if ('accel' in data) this.steer_data.accel = data.accel
  if ('shot' in data) this.steer_data.shot = data.shot
  if ('pitch' in data) this.steer_data.pitch = data.pitch
  if ('mode' in data) this.steer_data.mode = data.mode
  
  /*  if (!data.shot) this.shop_flag = true;
      else if (this.shop_flag) {
      if (this.state != 'charging' && Game.state == 'running') return;
      Game.triggerShop(this);
      this.shop_flag = false;
      }
  */
}

Ship.prototype.step = function() {
  
  if(this.shield) this.shield.step();
  
  var self = this;
  if (!this.steer_data) return;
  switch(this.state) {
  case 'flying':
    if (this.steer_data.accel) {
      this.accelerate();
      this.smoke();
    }
    this.rotate(this.steer_data.mode, this.steer_data.pitch);    
    if (this.steer_data.shot) this.shoot();
    this.apply_physics();
    break;
  case 'opening':
    if (this.steer_data.accel) this.trigger_close();
    break;
  case 'charging':
    if (this.steer_data.accel) this.trigger_close();
    //if (this.steer_data.shot) {
    //  Game.enterShop(self);
    //}
    else {
      this.energy += this.heal_per_sec * (Animation.time-this.last_time) / 1000;
      if (this.energy > this.max_energy) this.energy = this.max_energy;
    }
    break;
  case 'closing':
    if (!this.steer_data.accel) this.trigger_open();
    else { this.smoke(); this.smoke(); }
    break;
  }
  this.last_time = Animation.time;
}

Ship.prototype.spawn = function() {
  var trys = 0;
  while (true) {
    trys++
    var p = Game.ship_spawn_pts[Math.floor(Math.random()*Game.ship_spawn_pts.length)]
    if (Game.check_collision(p[0],p[1], this.collision_radius) === false) {
      this.x = p[0]; this.y = p[1]; 
      this.rot = 0;
      this.trigger_charge();
      break;
    }
    if (trys > 15) {
      this.x = Game.borders.left + this.collision_radius + Math.random()*(Game.borders.right-Game.borders.left-2*this.collision_radius);
      this.y = Game.borders.top + this.collision_radius + Math.random()*(Game.borders.bottom-Game.borders.top-2*this.collision_radius);
      this.rot = Math.random()*0.2 - 0.1;
      this.trigger_fly();
      break;
    }
  }
  this.display = true;
  this.destroyed = false;
  this.energy = 100;
  this.last_shoot_time = 0;
  this.last_smoke_time = 0;
  this.last_time = Animation.time;
  this.vx = this.vy = 0;
}

Ship.prototype.isAccelerating = function() {
  return this.steer_data && this.steer_data.accel;
}

Ship.prototype.isShooting = function() {
  return this.steer_data && this.steer_data.shot;
}

Ship.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, 'XL');
  expl.rot = this.rot;
  var code = this.code;
  sendVibrate(code, 1000);
}

Ship.prototype.accelerate = function() {
  this.vx += Math.sin(this.rot) * this.acceleration;
  this.vy += -Math.cos(this.rot) * this.acceleration;
}

Ship.prototype.rotate = function(mode, pitch) {
  if (mode == 'relative') {
    this.rot -= (pitch/500) * this.rotation_speed;
  } else if (mode == 'absolute') { // here, rotation_speed is irrelevalt!
    var delta = (-pitch*Math.PI/180)-this.rot;
    delta = norm_rotation(delta);
    if (delta > 0.3) delta = 0.3;
    if (delta < -0.3) delta = -0.3;
    this.rot += delta*0.5;
  }
}

Ship.prototype.smoke = function() {
  return;
  if (Animation.time - this.last_smoke_time < this.smoke_interval) return;
  this.last_smoke_time = Animation.time;
  var rot = (this.rot + Math.PI/2);
  var r = 25;
  if (this.state == 'closing') r = 15;
  var s = new Smoke(this.x+Math.cos(rot)*r+(Math.random()-0.5)*6,
                    this.y+Math.sin(rot)*r+(Math.random()-0.5)*6,
                   'rocket-S');
  s.alpha = 0.7
}

Ship.prototype.shoot = function() {
  if (Animation.time-this.last_shot_time < this.shot_delay) return;
  this.last_shot_time = Animation.time;
  var dx = Math.sin(this.rot);
  var dy = -Math.cos(this.rot);

  var angleFix = !(this.num_shots % 2) ? this.shot_angle/2 : 0;   
  for(var i=0;i<this.num_shots;++i){
    new Shot(this.shot_level,
             this,this.x+dx*5+this.vx, this.y+dy*5+this.vy, 
             this.vx, this.vy, this.shot_speed, 
             angleFix + this.rot + this.shot_angle * (i-this.num_shots/2),
             this.shot_energy,this.shot_max_dist);

  }
  if(this.curr_rocket_count < this.rocket_count_max){
    new Rocket(this,this.x,this.y,this.rot,this.rocket_warhead_energy, this.rocket_mass, 
               this.rocket_sensor_range, this.rocket_turn_speed, this.rocket_scale);
  }
}

Ship.prototype.apply_physics = function() {
  this.vx += Game.grav_x;
  this.vy += Game.grav_y;

  this.vx *= 1.0-Game.air_friction;
  this.vy *= 1.0-Game.air_friction;
  this.x += this.vx;
  this.y += this.vy;
}

Ship.max_land_speed = 0.5;

Ship.prototype.destroy = function() {
//  Game.lives-=1;
  this.lives--;
  this.heat = 0;
  this.energy = 0;
  this.explode();
  this.display = false;
  this.destroyed = true;
  if (this.lives>0) setTimeout(jQuery.proxy(this.spawn, this), this.respawn_delay);
}

Ship.prototype.hit = function(energy, x, y) {
  if (this.destroyed) return 0;

  // the shield absorbs some shoot damage
  var energyAbsorbedByShield = 0; 
  if (this.shield) {
    energyAbsorbedByShield = energy - this.shield.hit(x,y,energy);
    energy -= energyAbsorbedByShield;
  }
  if (this.state != 'flying') energy *= 2;
  if (energy > 10) sendVibrate(this.code);
  if (this.energy<=energy) this.destroy(3000);
  else this.energy -= energy;

  return energyAbsorbedByShield;
}

Ship.prototype.attempt_land = function(line) {
  //console.log('attempting to land');
  if (this.state != 'flying') return true;
  // check for speed
  var speed2 = this.vx*this.vx+this.vy*this.vy;
  //console.log('current speed: ' + Math.sqrt(speed2));
  if (speed2 > Ship.max_land_speed*Ship.max_land_speed) return false;
  // check for rotation of ship and ground
  this.rot = norm_rotation(this.rot);
  //console.log('current rotation: ' + this.rot);
  if (Math.abs(this.rot) > 0.79) return false; 
  var l_rot = Math.atan2(line.B.y-line.A.y, line.B.x-line.A.x);
  //console.log('ground rotation: ', l_rot);
  if (Math.abs(l_rot) > 0.79) return false; 
  // check rotation difference to ground 
  var delta_rot = (l_rot-this.rot);
  //console.log('delta rotation: ', delta_rot);
  if (Math.abs(delta_rot) > 0.35) return false;
  // set rotation and land
  this.rot = l_rot;
  this.vx = 0; this.vy = 0;
  this.trigger_open();
  return true;
}

Ship.prototype.trigger_open = function() {
  if (this.state == 'closing') var frame = this.animation.frame;
  this.animation.setAnimation(120, 'ship-solar-'+this.color);
  if (this.state == 'closing') this.animation.frame = frame;
  this.animation.loop = false;
  var self = this;
  this.animation.finished_callback = function() { self.trigger_charge.call(self) }
  this.state = 'opening';
}

Ship.prototype.trigger_close = function() {
  if (this.state == 'opening') var frame = this.animation.frame;
  this.animation.setAnimation(120, 'ship-solar-'+this.color, 'backward');
  if (this.state == 'opening') this.animation.frame = frame;
  this.animation.loop = false;
  var self = this;
  this.animation.finished_callback = function() { self.trigger_fly.call(self) }
  this.state = 'closing';
}

Ship.prototype.trigger_charge = function() {
  this.animation.setAnimation(120, 'ship-solar-'+this.color+'-open');
  this.animation.loop = true;
  this.animation.finished_callback = null;
  this.state = 'charging';
}

Ship.prototype.trigger_fly = function() {
  this.animation.setAnimation(120, 'ship-'+this.color);
  this.animation.loop = true;
  this.animation.finished_callback = null; 
  this.state = 'flying';
}

Ship.id = 0;
Ship.colors = global_ship_colors;
Ship.next_color = 0;
Ship.getNextColor = function() {
  var result = Ship.colors[Ship.next_color++];
  if (Ship.next_color >= Ship.colors.length) Ship.next_color = 0;
  return result;
}

Ship.prototype.init_sprite = function() {
  this.color = Ship.getNextColor();
  jQuery.extend(this, new Sprite(120, 'ship-'+this.color));
  this.offset_x = 2; this.offset_y = -3;
  this.scale = 1//0.9;
  Game.main_sprite.child_sprites.push(this);
  var ship = this;
  var flame_sprite = new Sprite(160, 'flame-XL');
  flame_sprite.scale = 1//0.8;
  flame_sprite.y = 18; flame_sprite.alpha = 0.9;
  flame_sprite.display = function() { return ship.isAccelerating() && ship.state == 'flying' };
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);
  
  if(this.shield){
    this.child_sprites.push(this.shield);
  }
}

Ship.prototype.createScoreSprite = function() {
  var ship = this;
  var sprite = new Sprite([], '');
  var ship_sprite_1 = new Sprite(80, 'ship-'+this.color);
  ship_sprite_1.animation.stop();
  ship_sprite_1.scale = 0.7;
  var ship_sprite_2 = new Sprite(80, 'ship_gray');
  ship_sprite_2.animation.stop();
  ship_sprite_2.scale = 0.7;
  sprite.extra_draw = function(ctx) {
    // energy and heat bar
    var l = 60;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    if(ship.state == 'charging' && ship.energy !=  ship.max_energy){
      var g = Math.round(127*(1.5+0.5*Math.sin(Animation.time/70)));
      ctx.fillStyle = 'rgba(50,'+g+',0,0.5)';
    }else{
      ctx.fillStyle = 'rgba(0,255,0,0.5);'
    }
    ctx.lineWidth = 1;
    var w = l*ship.energy*(1.0/ship.max_energy); //0.01;
    ctx.fillRect(0,8,w,10);
    ctx.strokeRect(0,8,l,10);
    // write player name
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = Colors.gray;
    ctx.font = '15px "prelude"';
    ctx.fillText(ship.player_name, 20, -3);

    // shield:
    if(ship.shield){
      if(ship.shield.energyRatio > 0.2){
        ctx.fillStyle = "rgba(0,100,255,0.5)"
      }else{
        ctx.fillStyle = "rgba(255,0,0,0.5)"
      }
      ctx.fillRect(0,28,ship.shield.energyRatio*l,7);
      ctx.strokeRect(0,28,l,7);
    }

    try {
      ctx.save();
      ctx.translate(8,4);
      ship_sprite_1.draw(ctx);
      ctx.translate(60,8);
      ctx.fillText('Lives:'+ship.lives,0,0);
    } finally { ctx.restore(); }

    /*
    // lives
    ctx.save();
    ctx.translate(8, 10);
    for (var i=0; i<3; i++) {
    ship.lives>i ? ship_sprite_1.draw(ctx) : ship_sprite_2.draw(ctx);
    ctx.translate(7, 0);
    }
    ctx.restore();
    */
  }
  return sprite;
}

