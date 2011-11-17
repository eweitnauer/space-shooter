///** Classical U.F.O. type of alien ship. It moves on a horizontal line at the
//    top of the screen and releases mines. */
Ufo = function() {
  this.type = 'alien_ship'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensors = [];        // an array of sensors results
  this.sensor_range = 60;   // max. sensor range
  this.v_max = 1.0;         // maximum speed
  this.turn_speed = 0.1;    // turning speed
  this.acceleration = 0.02; // acceleration
  this.points = 100;        // points the players get on destruction
  this.coins = 100;         // coins the players get on destruction
  
  this.sprite_name = 'alien_ufo';    // visual appearance of the alien
  this.explosion_size = 'XXL';       // size of the explosion when destroyed
  this.offset_rot = Math.PI*0.25;    // rotate imgs by 45 deg.
  this.offset_x = this.offset_y = 3; // img offset
  this.collision_radius = 16;        // collision radius for physics
  this.restitution = 0.9;            // restitution for collision
  this.mass = 4;                     // mass of ship
  this.max_energy = 100;             // energy at creation
  
  this.max_mine_count = 3;     // number of mines per production cycle
  this.release_rate = 1000;    // time between releasing two mines
  this.production_time = 5000; // time needed to procude max_mine_count mines
  
  this.init_sprite();
  this.spawn();
  this.my_spawn();
}

Ufo.prototype = new Alien();
Ufo.prototype.constructor = Ufo;

Ufo.prototype.my_spawn = function() {
  this.next_production_finished_at = Animation.time+this.production_time;
  this.state = 'flying';
  this.x = Game.borders.left + this.collision_radius + Math.random() * 
           (Game.borders.right-Game.borders.left-2*this.collision_radius);
  this.y = Game.borders.top + this.collision_radius + Math.random() * 0.2 * 
           (Game.borders.bottom-Game.borders.top-2*this.collision_radius);
  this.target_y = this.y;
  this.preferred_dir = Math.random() < 0.5 ? 'left' : 'right';
}

Ufo.prototype.smoke = function() {
  if (this.energy > this.max_energy*0.5) return;
  if (Math.random() < 0.25 && Math.random()*this.max_energy*0.5 > this.energy) {
    var x = Math.random()*10-5, y = Math.random()*10-5;
    var s = new Smoke(x, y, 'small-rocket-smoke', this);
    s.alpha = 1-(this.energy/this.max_energy);
  }
}

Ufo.prototype.step = function() {
  this.think();
  this.adjust_speed();
  this.x += this.vx;
  this.y += this.vy;
  this.smoke();
  this.adjust_rot(0.035);
}

/// If slower than v_max, accelerate. If faster than v_max, deccelerate. Fly
/// in the preferred_dir.
Ufo.prototype.adjust_speed = function() {
  if (this.vy != 0) this.vy += (this.vy>0) ? -this.acceleration : this.acceleration;
  var dir = Math.atan2(this.vy, this.vx);
  var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
  if (v>this.v_max) v = Math.max(0, v-this.acceleration);
  if (v<this.v_max) v = Math.min(this.v_max, v+this.acceleration);
  this.vx = v * Math.cos(dir);
  this.vy = v * Math.sin(dir);
}

Ufo.prototype.think = function() {
  this.sense(this.sensor_range);
  this.avoid_obstacles_behavior({landscape: this.sensor_range,
                                 alien_ship: this.sensor_range,
                                 alien_shot: 10});
  this.drop_mines_behavior();
}

Ufo.prototype.drop_mines_behavior = function() {
  if (this.state == 'flying') {
    if (Animation.time >= this.next_production_finished_at) {
      this.state = 'releasing mines';
      this.mines = this.max_mine_count;
      this.next_mine_release_at = Animation.time + this.release_rate;
    }
  } else if (this.state == 'releasing mines') {
    if (Animation.time >= this.next_mine_release_at) {
      if (this.mines == 0) {
        this.state = 'flying';
        this.next_production_finished_at = Animation.time + this.production_time;
      } else {
        this.next_mine_release_at = Animation.time + this.release_rate;
        this.release_mine();
      }
    }
  }
}

Ufo.prototype.release_mine = function() {
  new Mine(this.x, this.y + 25, 0, 1);
  this.mines--;
}
