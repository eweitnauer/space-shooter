var Ship = function(session_code) {
  this.init_sprite();
  this.score_sprite = this.createScoreSprite();
  this.player_name = 'Peter Pan';
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
  this.heat = 0;
  this.energy = 100;
  this.last_shot_time = 0;
  this.cooldown_per_sec = 15;
  this.heat_per_shot = 10;
  this.heal_per_sec = 15;
  this.last_time = 0;
  this.shot_delay = 250; // in ms
  this.session_code = session_code;
  this.steer_data = { shot:false, accel:false, pitch:0 };
  this.points = 0;
  this.destroyed = false;

  this.spawn = function() {
    this.display = true;
    this.destroyed = false;
    this.heat = 0;
    this.energy = 100;
    this.landed = false;
    this.last_time = Animation.time;
    this.x = Game.borders.left + this.collision_radius + Math.random()*(Game.borders.right-Game.borders.left-2*this.collision_radius);
    this.y = Game.borders.top + this.collision_radius + Math.random()*(Game.borders.bottom-Game.borders.top-2*this.collision_radius);
    this.rot = Math.random()*2*Math.PI;
    this.vx = this.vy = 0;
  }
  
  this.steer = function(data){
      this.steer_data = data;
  }

  this.hasAccel = function() {
      return this.steer_data && this.steer_data.accel;
  }
  
  this.turnsLeft = function() {
    return this.steer_data && this.steer_data.pitch < -5;
  }

  this.turnsRight = function() {
    return this.steer_data && this.steer_data.pitch > 5;
  }
  
  this.isShooting = function() {
    return this.steer_data && this.steer_data.shot;
  }
  
  this.explode = function() {
    for (var t=600; t>=0; t-=100) {
      for (var i=0; i<2; ++i) {
        var r = (10+t/20) + Math.random()*10-5;
        var a = Math.random()*Math.PI*2;
        var expl = new Explosion(this.x+Math.cos(a)*r, this.y+Math.sin(a)*r);
        expl.animation.delay_time = t;
      }  
    }
  }
 
  this.step = function() {
      if (this.steer_data){
          if(this.steer_data.pitch && !this.landed){
            if (this.code == 'key' || this.steer_data.mode == 'relative') {
              this.rot -= this.steer_data.pitch/1000;
            } else if (this.steer_data.mode == 'absolute') {
              var delta = (-this.steer_data.pitch*Math.PI/180)-this.rot;
              delta = Ship.norm_rotation(delta);
              if (delta > 0.3) delta = 0.3;
              if (delta < -0.3) delta = -0.3;
              this.rot += delta*0.5;
            }
          }
          if(this.steer_data.accel){
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              this.vx += dx * 0.1 * (this.steer_data.accel ? 1 : 0);
              this.vy += dy * 0.1 * (this.steer_data.accel ? 1 : 0);
              if (Math.random()< 0.67) {
                var rot = (this.rot + Math.PI/2);
                var r = 20;
                new Smoke(this.x+Math.cos(rot)*r+(Math.random()-0.5)*6,
                          this.y+Math.sin(rot)*r+(Math.random()-0.5)*6);
              }
              this.landed = false;
          }
          if (!this.landed && this.steer_data.shot && (Animation.time-this.last_shot_time >= this.shot_delay)) {
            this.last_shot_time = Animation.time;
            if (this.heat + this.heat_per_shot > 100) {
              this.heat = Math.min(100, this.heat + this.heat_per_shot/4);
            } else {
              this.heat += this.heat_per_shot;
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              Game.shots.push(new Shot(this,this.x+dx*5+this.vx, this.y+dy*5+this.vy, this.vx, this.vy, 10, this.rot, 10));
            }
          }           
      }
      if (!this.landed) {
        this.vx += Game.grav_x;
        this.vy += Game.grav_y;

        this.vx *= 1.0-Game.air_friction;
        this.vy *= 1.0-Game.air_friction;
        this.x += this.vx;
        this.y += this.vy;
      } else {
        this.energy += this.heal_per_sec * (Animation.time-this.last_time) / 1000;
        if (this.energy > 100) this.energy = 100;
      }
            
      this.heat -= this.cooldown_per_sec * (Animation.time-this.last_time) / 1000;
      if (this.heat < 0) this.heat = 0;
      this.last_time = Animation.time;
  }
};

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
  if (this.energy<=energy) this.destroy(3000);
  else this.energy -= energy;
}


/// Returns the passed angle projected into the interval [-Pi, Pi] by adding or
/// subtracting multiples of 2*Pi.
Ship.norm_rotation = function(rot) {
  var r = rot % (Math.PI*2);
  if (r < -Math.PI) r += 2*Math.PI;  
  else if (r > Math.PI) r -= 2*Math.PI;  
  return r;
}

Ship.prototype.land = function() {
  //console.log('landing');
  this.vx = 0;
  this.vy = 0;
  this.landed = true;
}

Ship.prototype.attempt_land = function(line) {
  //console.log('attempting to land');
  // check for speed
  var speed2 = this.vx*this.vx+this.vy*this.vy;
  //console.log('current speed: ' + Math.sqrt(speed2));
  if (speed2 > Ship.max_land_speed*Ship.max_land_speed) return false;
  // check for rotation of ship and ground
  this.rot = Ship.norm_rotation(this.rot);
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
  this.land();
  return true;
}

Ship.id = 0;
Ship.colors = ['red', 'blue', 'orange', 'violett'];
Ship.next_color = 0;
Ship.getNextColor = function() {
  var result = Ship.colors[Ship.next_color++];
  if (Ship.next_color >= Ship.colors.length) Ship.next_color = 0;
  return result;
}

Ship.prototype.init_sprite = function() {
  this.color = Ship.getNextColor();
  jQuery.extend(this, new Sprite(80, 'ship_'+this.color));
  this.offset_x = 3; this.offset_y = -1;
  Game.main_sprite.child_sprites.push(this);
  this.scale = 0.9;
  var ship = this;
  var flame_sprite = new Sprite(80, 'flame');
  flame_sprite.y = 20; flame_sprite.alpha = 0.7;
  flame_sprite.display = function() { return ship.hasAccel() };
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
  ship_sprite.scale = 0.6; ship_sprite.x = 10; ship_sprite.y = 10;
  sprite.child_sprites.push(ship_sprite);
  sprite.extra_draw = function(ctx) {
    // energy and heat bar
    var l = 35;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.fillStyle = 'rgba(0,255,0,0.5)';
    var w = l*ship.energy*0.01;
    ctx.fillRect(25,3,w,6);
    ctx.strokeRect(25,3,l,6);
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    var w = l*ship.heat*0.01;
    ctx.fillRect(25,13,w,6);
    ctx.strokeRect(25,13,l,6);
    // write player name
    ctx.font = "bold italic 15 px sans";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = '#555';
    ctx.fillText(ship.player_name + ': ' + ship.points, 67, 13);
  }
  return sprite;
}