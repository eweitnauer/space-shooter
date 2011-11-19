var Fighter = function() {
  this.type = 'alien_ship'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 4;    // number of sensors
  this.sensor_range = 500;  // max. sensor range
  
  // small rocket
  this.v_max = 2;         // maximum speed
  this.turn_speed = 0.12;   // turning speed

  this.acceleration = 0.02; // acceleration
  this.coins = 555;           // coins the players get on destruction
  
  this.sprite_name = 'alien_fighter'; // visual appearance of the alien
  this.scale = 0.6;
  this.explosion_size = 'L'; // size of the explosion when destroyed

  this.collision_radius = 4; // collision radius for physics
  this.restitution = 0.3;    // restitution for collision
  this.mass = 1;             // mass of ship
  this.max_energy = 50;      // energy at creation
  
  this.obstacle_range_near = 20; // turn away from obstacles (hunting mode)
  this.obstacle_range_far = 50;  // turn away from obstacles (non hunting mode)
  this.hunting_range = 250;       // ship closer than this will be hunted
  this.schooling_range = 80;      // align with other missiles inside this range

  this.my_init_sprite();
  this.my_spawn();
  
  this.last_time_shot = Animation.time;
  this.shot_time = 1000;
  this.shot_level = 2;
  this.shot_speed = 5;
  this.shot_energy = 5;
  this.shot_max_dist = 300;
}

Fighter.prototype = new Alien();
Fighter.prototype.constructor = Fighter;

Fighter.prototype.my_init_sprite = function() {
  // alternativ : alien_rocket
  // dann allerdings ohne flame, und mit 100ms
  this.init_sprite();

  // die flame brauchen wir nur für die small rocket!
  var flame_sprite = new Sprite(40, 'small_rocket_flame');
  flame_sprite.y = 20; flame_sprite.alpha = 0.9;
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);
}

Fighter.prototype.my_spawn = function() {
  this.spawn();
  this.vx = 0; this.vy = 0;
  this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
}

Fighter.prototype.smoke = function() {
  if (Math.random() > 0.6 && Math.sqrt(this.vx*this.vx + this.vy*this.vy) > 1){
    var r = 8;
    var s = new Smoke(this.x-this.vx*r, this.y-this.vy*r, "very-small-rocket-smoke");
    s.scale = 0.5 + Math.random() * 0.2 ;
    s.alpha = 0.8 + Math.random() *  0.2;
    s.alpha_decay = 0.05 + Math.random() * 0.1;
  }
}

/// Fighter will follow the closest player inside its hunting_range.
Fighter.prototype.hunting_behavior = function() {
  var ship = null, d=null;
  var N = this.sensor_count;
  for (var i=0; i<N; i++) {
    if (this.sensors[i] == null) continue;
    if (this.sensors[i][1].type != 'ship') continue;
    if (this.sensors[i][0] > this.hunting_range) continue;
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
  if (Math.random() < 0.04) {
    this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
  }
  if (Math.random() < 0.2) {
    if (this.preferred_dir == 'left') this.turn_left();
    else this.turn_right();
  }
}

Fighter.prototype.shoot_behavior = function(){
  var now = Animation.time;
  if((now - this.last_time_shot) > this.shot_time){
    var s = new Shot(this.shot_level,null,this.x,this.y,this.vx,this.vy,
                     this.shot_speed,this.rot,this.shot_energy,this.shot_max_dist);
    this.last_time_shot = now;
    s.scale = 0.5;
    Game.shots.push(s);
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

  if (this.avoid_obstacles_behavior(
    { landscape: this.obstacle_range_near,
      alien_ship: this.obstacle_range_near,
      alien_shot: this.obstacle_range_near
    })) return;
  if (this.hunting_behavior()){
    this.shoot_behavior();
    return;
  }
  if (this.avoid_obstacles_behavior(
    { landscape: this.obstacle_range_far,
      alien_ship: this.obstacle_range_far
    })) return;
  this.random_flight_behavior();  
}
