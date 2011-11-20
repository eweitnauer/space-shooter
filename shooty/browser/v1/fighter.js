var Fighter = function() {
  this.type = 'alien_ship'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensor_range = 350;  // max. sensor range
  
  // small rocket
  this.v_max = 2;         // maximum speed
  this.turn_speed = 0.12;   // turning speed

  this.acceleration = 0.02; // acceleration
  this.coins = 555;           // coins the players get on destruction
  
  this.sprite_name = 'alien_fighter'; // visual appearance of the alien
  this.scale = 0.7;
  this.explosion_size = 'L'; // size of the explosion when destroyed

  this.collision_radius = 4; // collision radius for physics
  this.restitution = 0.3;    // restitution for collision
  this.mass = 0.3;           // mass of ship
  this.max_energy = 50;      // energy at creation
  
  this.obstacle_range_near =  // turn away from obstacles closer than x (hunting mode)
    { ship: 50
     ,alien_ship: 20
     ,alien_shot: 10
     ,landscape: 30 };
  this.obstacle_range_far =   // turn away from obstacles closer than x (non hunting mode)
    { landscape: 120
     ,alien_ship: 50
     ,alien_shot: 50};
  this.hunting_range = 350;       // ship closer than this will be hunted

  this.my_init_sprite();
  this.my_spawn();
  
  this.smoke_interval = 150;   // one puff every x ms
  this.shot_time = 500;    // time between two bullets
  this.shot_level = 2;
  this.shot_speed = 5;
  this.shot_energy = 4;
  this.shot_max_dist = 300;
}

Fighter.prototype = new Alien();
Fighter.prototype.constructor = Fighter;

Fighter.prototype.my_init_sprite = function() {
  this.init_sprite();

  var flame_sprite = new Sprite(40, 'small_rocket_flame');
  flame_sprite.y = 20; flame_sprite.alpha = 0.9;
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);
}

Fighter.prototype.my_spawn = function() {
  this.spawn();
  this.vx = 0; this.vy = 0;
  this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
  this.last_time_shot = Animation.time;
  this.last_smoke_time = Animation.time;
}

Fighter.prototype.smoke = function() {
  if (Math.sqrt(this.vx*this.vx + this.vy*this.vy) < 0.5) return;
  if (Animation.time - this.last_smoke_time < this.smoke_interval) return;
  this.last_smoke_time = Animation.time;
  var r = 15;
  var p = new Point(this.vx, this.vy);
  p.normalize();
  var s = new Smoke(this.x-p.x*r, this.y-p.y*r, "very-small-rocket-smoke"); 
  s.scale = 0.6;
  s.alpha = 0.7;
  s.alpha_decay = 0.05;
}

/// Fighter will follow the closest player inside its hunting_range.
Fighter.prototype.hunting_behavior = function() {
  var ship = null, d=null;
  var N = this.sensor_count;
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null) continue;
    if (this.sensors[i][1].type != 'ship') continue;
    if (this.sensors[i][0] > this.hunting_range) continue;
    // make some distance first before turning around for next attac
    if (i >= N*0.25 && i < N*0.75 && this.sensors[i][0] < 0.5*this.hunting_range) continue;
    if (ship == null || this.sensors[i][0] < d) {
      ship = this.sensors[i][1];
      d = this.sensors[i][0];
    }
  }
  if (ship != null) {
    this.turn_towards(ship.x, ship.y);
    return true;
  }
  return false;
}

/// Random flight with preferred turning direction.
Fighter.prototype.random_flight_behavior = function() {
  if (Math.random() < 0.02) {
    var rnd = Math.random();
    this.preferred_dir = rnd < 0.33 ? 'left' : (rnd < 0.67 ? 'right' : 'straight');
  }
  if (this.preferred_dir == 'left') this.turn_left(Math.random()*0.3);
  else if (this.preferred_dir == 'right') this.turn_right(Math.random()*0.3);
}

Fighter.prototype.shoot_behavior = function(){
  var now = Animation.time;
  var N = this.sensor_count;
  if ((now - this.last_time_shot) > this.shot_time) {
    // check whether ship is in front of alien and in range
    if ((this.sensors[0] && this.sensors[0][1].type == 'ship'
         && this.sensors[0][0] <= this.hunting_range) ||
        (this.sensors[N-1] && this.sensors[N-1][1].type == 'ship'
         && this.sensors[N-1][0] <= this.hunting_range)) {
      var s = new Shot(this.shot_level,null,this.x,this.y,this.vx,this.vy,
                       this.shot_speed,this.rot,this.shot_energy,this.shot_max_dist);
      this.last_time_shot = now;
      s.scale = 0.7;

      this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
    }
  }
}

/// Step function that should be called every cicle.
Fighter.prototype.step = function() {
  this.think();
  this.adjust_speed();
  this.x += this.vx;
  this.y += this.vy;
  this.rot = Math.atan2(this.vy, this.vx)+Math.PI/2;
  this.smoke();
}

Fighter.prototype.think = function() {
  this.sense(this.sensor_range);

  this.shoot_behavior();

  if (this.avoid_obstacles_behavior(this.obstacle_range_near)) return;

  if (this.hunting_behavior()) return;

  if (this.avoid_obstacles_behavior(this.obstacle_range_far)) return;

  this.random_flight_behavior();  
}
