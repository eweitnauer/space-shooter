var Game = {
   w: 640, h: 500
   , grav_x:0, grav_y:9.81/500
   , air_friction: 0.01
  ,step_timer: null
  ,ships: {}
  ,start: function() {
    this.canvas = document.getElementById("canvas");
    this.canvas.width = this.w; 
    this.canvas.height = this.h;
    this.painter = new PaintEngine(this.canvas.getContext("2d"));
    this.step_timer = setInterval(this.step, 30);
  }
  ,step: function() {
    for (s in Game.ships) Game.ships[s].step();
    Game.painter.paint();
  }
   ,shipcolors: ['rgba(255,0,0,0.7)','rgba(0,255,0,0.7)','rgba(0,0,255,0.7)','rgba(0,0,0,0.7)']
   ,nextshipcolor : 0
};

var Images = {
    ship: new Image,
    flames: [ new Image, new Image, new Image ],
    next_flame: 0,
    getFlameImage: function(){
        this.next_flame = (this.next_flame+1) % 3;
        return this.flames[this.next_flame];
    },
    bg: new Image
};
Images.ship.src = 'graphics/ship-30x30.png';
Images.flames[0].src = 'graphics/flame-1.png';    
Images.flames[1].src = 'graphics/flame-2.png';    
Images.flames[2].src = 'graphics/flame-3.png';    
Images.bg.src = 'graphics/bg.jpg';


var Ship = function(session_code) {
  var self = this;
  this.id = Ship.id++;
  this.x = 320;
  this.y = 250;
  this.rot = 0;
  this.vx = 0;
  this.vy = 0;
  //this.accel = 0;
  this.energy = 100;
  this.session_code = session_code;
  this.color = Game.shipcolors[Game.nextshipcolor++];
  Game.nextshipcolor = Game.nextshipcolor % 4;
  
  this.steer = function(data) {
    this.steer_data = data;
  }

  this.hasAccel = function() {
      return this.steer_data && this.steer_data.accel;
  }
  
  this.step = function() {
      if (this.steer_data){
          if(this.steer_data.pitch){
              this.rot -= this.steer_data.pitch/600;
          }
          if(this.steer_data.accel){
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              this.vx += dx * this.steer_data.accel;
              this.vy += dy * this.steer_data.accel;
          }
      }
      this.vx += Game.grav_x;
      this.vy += Game.grav_y;

      this.vx *= 1.0-Game.air_friction;
      this.vy *= 1.0-Game.air_friction;
      this.x += this.vx;
      this.y += this.vy;
  }
};
Ship.id = 0;



var projectiles = []; // {ship, x, y, vx, vy, energy}


var PaintEngine = function(canvas_context) {
  this.ctx = canvas_context;
  this.paint = function() {
      //this.ctx.fillStyle = 'rgb(0,0,0.6)';
      //this.ctx.fillRect(0,0,Game.w,Game.h);
  //    this.ctx.clearRect(0,0,Game.w, Game.h);
      this.ctx.drawImage(Images.bg,0,0);
    for (s in Game.ships) {
      this.paint_ship(Game.ships[s]);
    }
  }
  this.paint_ship = function(ship) {
    var c = this.ctx;
    c.save();
    c.translate(ship.x, ship.y);
    c.rotate(ship.rot);
    
    c.fillStyle = ship.color;


    c.translate(-Images.ship.width/2,-Images.ship.height/2);
    c.drawImage(Images.ship,0,0);
    c.beginPath();
    c.moveTo(6,20);
    c.lineTo(9,15);
    c.lineTo(9,25);
    c.lineTo(6,27);
    c.closePath();
    c.fill();

    c.beginPath();
    c.moveTo(19,15);
    c.lineTo(19,25);
    c.lineTo(22,27);
    c.lineTo(22,20);
    c.closePath();
    c.fill();
    
    if(ship.hasAccel()){
        c.drawImage(Images.getFlameImage(),0,28);
        c.drawImage(Images.getFlameImage(),23,28);
    }
    
    c.restore();
  }
};
