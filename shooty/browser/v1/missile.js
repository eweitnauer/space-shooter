/** Flying missiles, that are released by alien ships. They fly towards the closest
    player and move in swarms. The behavior of missiles is implemented in a number of
    behavior methods. These methods rely on the missiles' sensors.
    The missiles have a number of radial sensors. Each sensor can only detect the
    closest object in its direction. */

// To create a missile, pass along the initial position and speed.
var Missile = function(x, y, vx, vy) {
  this.type = 'alien_shot'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 4;    // number of sensors
  this.sensor_range = 250;  // max. sensor range
  this.v_max = 0.8;         // maximum speed
  this.turn_speed = 0.12;   // turning speed
  this.acceleration = 0.01; // acceleration
  this.coins = 1;           // coins the players get on destruction
  
  this.sprite_name = 'alien_small_rocket'; // visual appearance of the alien
  this.scale = 0.8;
  this.explosion_size = 'M'; // size of the explosion when destroyed
  this.shockwave =           // shockwave parameters (on explosion)
    { damage: 30             // max. damage dealt for affected objects
     ,damage_r1: 5           // if sth. is closer than this, deal max. damage
     ,damage_r2: 15          // if sth. is farer than this, deal no damage
    };
  this.collision_radius = 4; // collision radius for physics
  this.restitution = 0.3;    // restitution for collision
  this.mass = 0.1;           // mass of ship
  this.max_energy = 15;      // energy at creation
  
  this.self_destruct_range = 5;   // if ship comes closer than this, self destruct
  this.obstacle_range_near = 20; // turn away from obstacles (hunting mode)
  this.obstacle_range_far = 50;  // turn away from obstacles (non hunting mode)
  this.hunting_range = 250;       // ship closer than this will be hunted
  this.schooling_range = 80;      // align with other missiles inside this range

  this.my_init_sprite();
  this.my_spawn(x,y,vx,vy);
}

Missile.prototype = new Alien();
Missile.prototype.constructor = Missile;

Missile.prototype.my_init_sprite = function() {
  // alternativ : alien_rocket
  // dann allerdings ohne flame, und mit 100ms
  this.init_sprite();

  // die flame brauchen wir nur für die small rocket!
  var flame_sprite = new Sprite(200, 'small_rocket_flame');
  flame_sprite.y = 14; flame_sprite.alpha = 0.9;
  flame_sprite.draw_in_front_of_parent = false;
  this.child_sprites.push(flame_sprite);
}

Missile.prototype.my_spawn = function(x, y, vx, vy) {
  this.spawn();
  this.x = x; this.y = y;
  this.vx = vx; this.vy = vy;
  this.last_vx = vx; this.last_vy = vy;
  this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
}

Missile.prototype.smoke = function() {
  if(Math.random() > 0.9){
    var r = 18;
    var s = new Smoke(this.x-this.vx*r, this.y-this.vy*r, "very-small-rocket-smoke");
    s.scale = 0.7;
    s.alpha = 0.8 + Math.random() *  0.2;
    s.alpha_decay = 0.05 + Math.random() * 0.1;
  }
}

// Missile will align with other missiles inside its schooling_range.
Missile.prototype.schooling_behavior = function() {
  var N = this.sensor_count;
  var drot = 0;
  var rot = Math.atan2(this.vy, this.vx);
  var done = false;
  for (var i=0; i<N; i++) {
    if (!this.sensors[i] || !(this.sensors[i][1] instanceof Missile)) continue;
    if (this.sensors[i][0] > this.schooling_range) continue;
    if (i >= this.sensor_count*1/4 && i < this.sensor_count*3/4) continue;
    done = true;
    drot += norm_rotation(Math.atan2(this.sensors[i][1].vy, this.sensors[i][1].vx) - rot);
  }
  if (drot > 0) this.turn(Math.min(drot, this.turn_speed));
  else if (drot < 0) this.turn(Math.max(drot, -this.turn_speed));
  return done;
}

/// Missile will follow the closest player inside its hunting_range.
Missile.prototype.hunting_behavior = function() {
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

/// Missile will self destruct if any player ship is closer than self_destruct_range.
Missile.prototype.self_destruct_behavior = function() {
  var self = this;
  Game.forEachActiveShip(function(ship) {
    if (inner_dist(ship, self) <= self.self_destruct_range) {
      self.destroy();
      return true;
    }
  });
  return false;
}

/// Random flight with preferred turning direction.
Missile.prototype.random_flight_behavior = function() {
  if (Math.random() < 0.04) {
    this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
  }
  if (Math.random() < 0.2) {
    if (this.preferred_dir == 'left') this.turn_left();
    else this.turn_right();
  }
}

/// Step function that should be called every cicle.
Missile.prototype.step = function() {
  this.think();
  this.adjust_speed();
  this.x += this.vx;//(this.vx + this.last_vx)/2;
  this.y += this.vy;//(this.vy + this.last_vy)/2;
  this.last_vx = this.vx;
  this.last_vy = this.vy;
  this.rot = Math.atan2(this.vy, this.vx)+Math.PI/2;
  this.smoke();
}

Missile.prototype.think = function() {
  this.sense(this.sensor_range);
  if (this.self_destruct_behavior()) return;
  if (this.avoid_obstacles_behavior(
        { landscape: this.obstacle_range_near,
          alien_ship: this.obstacle_range_near,
          alien_shot: this.obstacle_range_near
        })) return;
  if (this.hunting_behavior()) return;
  if (this.avoid_obstacles_behavior(
        { landscape: this.obstacle_range_far,
          alien_ship: this.obstacle_range_far
        })) return;
  if (this.schooling_behavior()) return;
  this.random_flight_behavior();  
}
