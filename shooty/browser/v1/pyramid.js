/** An alien ship looking like a flying pyramid. They move around on the whole
    map and release three homing missles in direction of their edges from time to 
    time. */

var Pyramid = function() {
  this.type = 'alien_ship'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensor_range = 100;  // max. sensor range
  this.v_max = 1.2;         // maximum speed
  this.turn_speed = 0.15;   // turning speed
  this.acceleration = 0.02; // acceleration
  this.coins = 100;         // coins the players get on destruction
  
  this.sprite_name = 'alien-pyramid'; // visual appearance of the alien
  this.explosion_size = 'L'; // size of the explosion when destroyed
  this.collision_radius = 12; // collision radius for physics
  this.restitution = 0.5;   // restitution for collision
  this.mass = 2;            // mass of ship
  this.max_energy = 100;    // energy at creation
  
  this.missile_time = 10000; // time between firing missiles in ms

  this.init_sprite();
  this.my_spawn();
}

Pyramid.prototype = new Alien();
Pyramid.prototype.constructor = Pyramid;

Pyramid.prototype.my_spawn = function() {
  this.spawn();
  this.prefered_dir = 'straight';
  this.slow_down = false;
  this.fire_missiles_at = Animation.time + this.missile_time;
}

/// Fire missile behavior. Will fire missiles every 'missile_time' ms, but only
/// after it stopped moving.
Pyramid.prototype.fire_missiles_behavior = function() {
  if (Animation.time < this.fire_missiles_at) return false;
  this.slow_down = true;
  if (!this.is_moving()) {
    // fire three missiles and set new time
    for (var deg = 0; deg<360; deg+=120) {
      var rad = (deg-90) * Math.PI / 180;
      new Missile(this.x + Math.cos(rad)*20, this.y + Math.sin(rad)*20,
                  Math.cos(rad), Math.sin(rad), Math.random() > 0.05 ? 'S' : 'L');
    }
    this.fire_missiles_at = Animation.time + this.missile_time;
  }  
  return true;
}

Pyramid.prototype.random_flight_behavior = function() {
  if (Math.random() < 0.04) {
    this.prefered_dir = Math.random() < 0.5 ? 'straight' : 
      (Math.random() < 0.5 ? 'left' : 'right');
  }
  if (this.prefered_dir != 'straight' && Math.random() < 0.2) {
    if (this.prefered_dir == 'left') this.turn_left();
    else this.turn_right();
  }
  return true;
}

Pyramid.prototype.think = function() {
  this.slow_down = false;
  this.sense(this.sensor_range);
  if (this.fire_missiles_behavior()) return;
  if (this.avoid_obstacles_behavior({landscape: this.sensor_range,
                                     alien_ship: this.sensor_range,
                                     alien_shot: 20})) return;
  this.random_flight_behavior();
}

Pyramid.prototype.step = function() {
  this.think();
  this.adjust_speed(this.slow_down);
  this.x += this.vx;
  this.y += this.vy;
  this.adjust_rot();
}
