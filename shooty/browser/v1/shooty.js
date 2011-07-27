var Game = {
   w: 640, h: 500
  ,grav_x:0, grav_y:-9.81
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
};

var Ship = function(session_code) {
  var self = this;
  this.id = Ship.id++;
  this.x = 320;
  this.y = 250;
  this.rot = 0;
  this.vx = 1;
  this.vy = 1;
  this.acc = 0;
  this.energy = 100;
  this.session_code = session_code;
  
  this.steer = function(data) {
    this.steer_data = data;
  }
  
  this.step = function() {
    if (this.steer_data && this.steer_data.pitch) {
      this.rot -= this.steer_data.pitch/600;
    }
    this.x += vx;
    this.y += vy;
  }
};
Ship.id = 0;

var projectiles = []; // {ship, x, y, vx, vy, energy}


var PaintEngine = function(canvas_context) {
  this.ctx = canvas_context;
  this.paint = function() {
    this.ctx.clearRect(0,0,Game.w, Game.h);
    for (s in Game.ships) {
      this.paint_ship(Game.ships[s]);
    }
  }
  this.paint_ship = function(ship) {
    var c = this.ctx;
    c.save();
    c.translate(ship.x, ship.y);
    c.rotate(ship.rot);
    
    c.fillStyle = "red";
    c.strokeStyle = "black";
    c.lineWidth = 2;
      
    c.beginPath();
    c.moveTo(0,-10);
    c.lineTo(10,10);
    c.lineTo(-10,10);
    c.closePath();
    c.fill();
    c.stroke();
    
    c.restore();
  }
};
