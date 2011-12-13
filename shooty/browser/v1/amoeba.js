///** Classical U.F.O. type of alien ship. It moves on a horizontal line at the
//    top of the screen and releases mines. */
Amoeba = function() {
  this.type = 'alien_ship'; // should be changed to 'alien_ship' or 'alien_shot'
  this.sensor_count = 6;    // number of sensors
  this.sensors = [];        // an array of sensors results
  this.sensor_range = 60;   // max. sensor range
  this.v_max = 1.0;         // maximum speed
  this.turn_speed = 0.1;    // turning speed
  this.acceleration = 0.02; // acceleration
  this.points = 100;        // points the players get on destruction
  this.coins = 100;         // coins the players get on destruction
  
  this.sprite_name = 'alien-amoeba';    // visual appearance of the alien
  this.explosion_size = 'green';       // size of the explosion when destroyed
  //this.offset_rot = Math.PI*0.25;    // rotate imgs by 45 deg.
  //this.offset_x = this.offset_y = 3; // img offset
  this.restitution = 0.9;            // restitution for collision
  this.mass = 4;                     // mass of ship
  this.max_energy = 100;             // energy at creation
  
  this.division_interval = 8000; // time that must pass until the amoeba is divided
  this.last_division_time = Animation.time;
  this.division_sprite = null;
  this.is_dividing = false;
  this.init_sprite();
  this.spawn();
  this.my_spawn();
  
  this.scale_up_factor = 1.002;
  this.scale_down_factor = 0.98;
  
  this.min_scale = 0.5;
  this.max_scale = 0.8;
  this.scale = this.min_scale;
  
  this.min_collision_radius = 6;
  this.max_collision_radius = 12;
  this.collision_radius = this.min_collision_radius;

  this.explosion_scale = 0.7;

}



Amoeba.prototype = new Alien();
Amoeba.prototype.constructor = Amoeba;

// this is just copied from the ufo
Amoeba.prototype.smoke = Ufo.prototype.smoke;
Amoeba.prototype.step = function(){
  this.think();
  this.adjust_speed();
  this.x += this.vx;
  this.y += this.vy;
  //  this.smoke();
  if(!this.is_dividing){
    this.rot += (Math.random()-.2)*0.1;
  }
}

Amoeba.prototype.adjust_speed = Ufo.prototype.adjust_speed;

Amoeba.prototype.think = function() {
  this.sense(this.sensor_range);
  this.avoid_obstacles_behavior({landscape: this.sensor_range,
                                 alien_ship: this.sensor_range,
                                 alien_shot: 10});
  this.divide_behaviour();
}

Amoeba.prototype.my_spawn = Ufo.prototype.my_spawn;

Amoeba.prototype.divide_behaviour = function(){
  if(this.is_dividing){
    this.scale *= this.scale_down_factor;
    this.collision_radius *= this.scale_down_factor;

    if(this.scale < this.min_scale) this.scale = this.min_scale;
    if(this.collision_radius < this.min_collision_radius) this.collision_radius = this.min_collision_radius;
    
    if(this.division_sprite.animation.frame == 11){
//      console.log('division done');
      var r = 22 * this.scale;
      var dr = 0.5;
      this.x -= Math.sin(this.rot+dr) * r;
      this.y -= -Math.cos(this.rot+dr) * r;
      this.hide_self_but_draw_children = false;
      this.child_sprites = [];
      this.is_dividing = false;
      this.last_division_time = Animation.time;
      this.animation.frame = 0;
      
      var other = new Amoeba();
      other.parent = this;
      r = 36 * this.scale;
      dr = 0.35;
      var dx =   Math.sin(this.rot+dr) * r;
      var dy = - Math.cos(this.rot+dr) * r;
      other.x = this.x + dx;
      other.y = this.y + dy;
      other.vx = this.vx;//+dx;
      other.vy = this.vy;//+dy;
      other.rot = this.rot;
      other.animation.frame = 10;
      other.scale = this.scale;
      other.collision_radius = this.collision_radius;
    }
  }else{
    this.scale *= this.scale_up_factor;
    if(this.scale > this.max_scale) this.scale = this.max_scale;

    this.collision_radius *= this.scale_up_factor;
    if(this.collision_radius > this.max_collision_radius) this.collision_radius = this.max_collision_radius;


    if( (Animation.time - this.last_division_time) > this.division_interval){
      if(this.animation.frame == 0){
        this.is_dividing = true;

        this.division_sprite = new Sprite(90,'alien-amoeba-division');        
        this.child_sprites.push(this.division_sprite);

        this.hide_self_but_draw_children=true;
      }
    } 
  }
}
