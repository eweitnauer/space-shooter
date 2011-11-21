///** Classical U.F.O. type of alien ship. It moves on a horizontal line at the
//    top of the screen and releases mines. */
YellowBox = function() {
  this.type = 'alien_ship'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensors = [];        // an array of sensors results
  this.sensor_range = 60;   // max. sensor range
  this.v_max = 1.0;         // maximum speed
  this.turn_speed = 0.1;    // turning speed
  this.acceleration = 0.02; // acceleration
  this.points = 100;        // points the players get on destruction
  this.coins = 100;         // coins the players get on destruction
  
  this.sprite_name = 'alien-yellow-box';    // visual appearance of the alien
  this.explosion_size = 'XXL';       // size of the explosion when destroyed
  //this.offset_rot = Math.PI*0.25;    // rotate imgs by 45 deg.
  //this.offset_x = this.offset_y = 3; // img offset
  this.collision_radius = 16;        // collision radius for physics
  this.restitution = 0.9;            // restitution for collision
  this.mass = 4;                     // mass of ship
  this.max_energy = 100;             // energy at creation
  
  this.max_mine_count = 5;     // number of mines per production cycle
  this.release_rate = 500;    // time between releasing two mines
  this.production_time = 5000; // time needed to procude max_mine_count mines
  
  this.init_sprite();
  this.spawn();
  this.my_spawn();
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
  /* Todo: add new mine class: 
     cube-mine:
     * The cubes use the 3D rotating cube images:
     * If a cube is destored, it breaks apart into N smaller cubes
     * the smaller cubes must be destroyed aswell
     * cubes do not move, they just stay where they are released
     * -> perhaps the YellowBox - cube collision must be disabled or something

  */
  //new Mine(this.x, this.y + 25, 0, 1);
  //this.mines--;
}
