var Ship = function(session_code) {
  this.init_sprite();
  this.score_sprite = this.createScoreSprite();
  this.player_name = '???';
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
  this.energy = 100;
  this.heal_per_sec = 15;
  this.last_time = 0;
  this.session_code = session_code;
  this.steer_data = { shot:false, accel:false, pitch:0 };
  this.points = 0;
  this.destroyed = false;
  this.state = 'flying'; // 'opening, charging, closing, flying'
};

Ship.prototype.steer = function(data) {
  this.steer_data = data;
}

Ship.prototype.step = function() {
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
      else {
        this.energy += this.heal_per_sec * (Animation.time-this.last_time) / 1000;
        if (this.energy > 100) this.energy = 100;
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
  this.display = true;
  this.destroyed = false;
  this.energy = 100;
  this.trigger_fly();
  this.last_shoot_time = 0;
  this.last_time = Animation.time;
  this.x = Game.borders.left + this.collision_radius + Math.random()*(Game.borders.right-Game.borders.left-2*this.collision_radius);
  this.y = Game.borders.top + this.collision_radius + Math.random()*(Game.borders.bottom-Game.borders.top-2*this.collision_radius);
  this.rot = Math.random()*2*Math.PI;
  this.vx = this.vy = 0;
}

Ship.prototype.isAccelerating = function() {
  return this.steer_data && this.steer_data.accel;
}

Ship.prototype.isShooting = function() {
  return this.steer_data && this.steer_data.shot;
}

Ship.prototype.explode = function() {
  var expl = new Explosion(this.x, this.y, 'L');
  expl.rot = this.rot;
  var code = this.code;
  sendVibrate(code, 1000);
}
  
Ship.prototype.accelerate = function() {
  this.vx += Math.sin(this.rot) * 0.1;
  this.vy += -Math.cos(this.rot) * 0.1;
}

Ship.prototype.rotate = function(mode, pitch) {
  if (mode == 'relative') {
    this.rot -= pitch/500;
  } else if (mode == 'absolute') {
    var delta = (-pitch*Math.PI/180)-this.rot;
    delta = norm_rotation(delta);
    if (delta > 0.3) delta = 0.3;
    if (delta < -0.3) delta = -0.3;
    this.rot += delta*0.5;
  }
}

Ship.prototype.smoke = function() {
    // idee: wir könnten smoke-alpha 
    // von der schiff-geschwindigkeit
    // abhängig machen
  if (Math.random()< 0.67) {
    var rot = (this.rot + Math.PI/2);
    var r = 25;
    if(this.state == 'closing'){
        r = 15;
    }
    var s = new Smoke(this.x+Math.cos(rot)*r+(Math.random()-0.5)*6,
                      this.y+Math.sin(rot)*r+(Math.random()-0.5)*6);
    
    s.rot = Math.random()*1.5-0.75;
      // shipSpeed \in [ 0 , 6 ]
    var shipSpeed = Math.sqrt(this.vx*this.vx + this.vy*this.vy)/6;

    s.alpha = 0.98+Math.random()*0.02 - shipSpeed/6;
    s.scale = 0.5+Math.random()*0.3;
    s.alpha_decay = 0.02+Math.random()*0.2 + shipSpeed/6*0.6;

  }
}

Ship.prototype.shoot = function() {
  if (Animation.time-this.last_shot_time < this.shot_delay) return;
  this.last_shot_time = Animation.time;
  var dx = Math.sin(this.rot);
  var dy = -Math.cos(this.rot);

  Game.shots.push(new Shot(this,this.x+dx*5+this.vx, this.y+dy*5+this.vy, this.vx, this.vy, 10, this.rot, 100));
  Game.shots.push(new Shot(this,this.x+dx*5+this.vx, this.y+dy*5+this.vy, this.vx, this.vy, 10, this.rot+0.1, 100));
  Game.shots.push(new Shot(this,this.x+dx*5+this.vx, this.y+dy*5+this.vy, this.vx, this.vy, 10, this.rot-0.1, 100));
//  Game.shots.push(new Shot(this,this.x+dx*5+this.vx, this.y+dy*5+this.vy, this.vx, this.vy, 10, this.rot-0.2, 100));
//  Game.shots.push(new Shot(this,this.x+dx*5+this.vx, this.y+dy*5+this.vy, this.vx, this.vy, 10, this.rot+0.2, 100));


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

Ship.prototype.destroy = function(respawn_delay) {
  this.points = Math.max(0, this.points-1);
  this.heat = 0;
  this.energy = 0;
  this.explode();
  this.display = false;
  this.destroyed = true;
  if (typeof(respawn_delay) != 'undefined') setTimeout(jQuery.proxy(this.spawn, this), respawn_delay);
}

Ship.prototype.hit = function(energy) {
  if (this.status != 'flying') energy *= 2;
  if (energy > 10) sendVibrate(this.code);
  if (this.energy<=energy) this.destroy(3000);
  else this.energy -= energy;
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
  this.animation.setAnimation(120, 'ship_solar_'+this.color);
  if (this.state == 'closing') this.animation.frame = this.animation._imgs.length-1-frame;
  this.animation.loop = false;
  var self = this;
  this.animation.finished_callback = function() { self.trigger_charge.call(self) }
  this.state = 'opening';
  
}

Ship.prototype.trigger_close = function() {
  if (this.state == 'opening') var frame = this.animation.frame;
  this.animation.setAnimation(120, 'ship_solar_'+this.color);
  if (this.state == 'opening') this.animation.frame = this.animation._imgs.length-1-frame;
  this.animation.reverse();
  this.animation.loop = false;
  var self = this;
  this.animation.finished_callback = function() { self.trigger_fly.call(self) }
  this.state = 'closing';
}

Ship.prototype.trigger_charge = function() {
  this.animation.setAnimation(120, 'ship_solar_open_'+this.color);
  this.animation.loop = true;
  this.animation.finished_callback = null;
  this.state = 'charging';
}

Ship.prototype.trigger_fly = function() {
  this.animation.setAnimation(120, 'ship_'+this.color);
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
  jQuery.extend(this, new Sprite(80, 'ship_'+this.color));
  this.offset_x = 2; this.offset_y = -3;
  this.scale = 0.9;
  Game.main_sprite.child_sprites.push(this);
  var ship = this;
  var flame_sprite = new Sprite(160, 'large_flame');
  flame_sprite.scale = 0.8;
  flame_sprite.y = 18; flame_sprite.alpha = 0.9;
  flame_sprite.display = function() { return ship.isAccelerating() && ship.state == 'flying' };
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);
}

Ship.prototype.createScoreSprite = function() {
  var ship = this;
  var sprite = new Sprite([], '');
  var ship_sprite = new Sprite([], '');
  ship_sprite.scale = 0.6; ship_sprite.x = 10; ship_sprite.y = 10;
  var img_active = ImageBank.get('ship_'+this.color, 0);
  var img_inactive = ImageBank.get('ship_gray', 0);
  ship_sprite.animation.getCurrentImage = function() {
    if (ship.destroyed) return img_inactive;
    else return img_active;
  }
  ship_sprite.scale = 0.75; ship_sprite.x = 15;
  sprite.child_sprites.push(ship_sprite);
  sprite.extra_draw = function(ctx) {
    // energy and heat bar
    var l = 26;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.fillStyle = 'rgba(0,255,0,0.5)';
    ctx.lineWidth = 1;
    var w = l*ship.energy*0.01;
    ctx.fillRect(0,19,w,7);
    ctx.strokeRect(0,19,l,7);
    // write player name
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = '#555';
    ctx.font = '15px "Permanent Marker"';
    ctx.fillText(ship.player_name, 30, 9);
    ctx.font = '12px "Permanent Marker"';
    ctx.fillText('points: ' + ship.points, 30, 22);
  }
  return sprite;
}
