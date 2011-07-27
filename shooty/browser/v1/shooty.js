var Game = {
   w: 640, h: 500
   , grav_x:0, grav_y:9.81/500
   , air_friction: 0.01
  ,step_timer: null
  ,ships: {}
   ,shots: []
  ,start: function() {
    this.canvas = document.getElementById("canvas");
    this.canvas.width = this.w; 
    this.canvas.height = this.h;
    this.painter = new PaintEngine(this.canvas.getContext("2d"));
    this.step_timer = setInterval(this.step, 30);
  }
  ,step: function() {
    for (s in Game.ships) Game.ships[s].step();
    var newShots = [];
    for (s in Game.shots) {
        Game.shots[s].step();
        if(!Game.shots[s].isAtEnd()){
            newShots.push(Game.shots[s]);
        }
    }
    Game.shots = newShots;
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
    shots: [ new Image, new Image, new Image ],
    next_shot: 0,
    getShotImage: function(){
        this.next_shot = (this.next_shot+1) % 3;
        return this.shots[this.next_shot];
    },
    bg: new Image
};
Images.ship.src = 'graphics/ship-30x30.png';
Images.bg.src = 'graphics/bg.jpg';

Images.flames[0].src = 'graphics/flame-1.png';    
Images.flames[1].src = 'graphics/flame-2.png';    
Images.flames[2].src = 'graphics/flame-3.png';    
Images.shots[0].src = 'graphics/shot-1.png';    
Images.shots[1].src = 'graphics/shot-2.png';    
Images.shots[2].src = 'graphics/shot-3.png';    


var Shot = function(id,x,y,v,rot,maxDist){
    var self = this;
    this.id = id;
    this.initx = x;
    this.inity = y;
    this.x = x;
    this.y = y;
    this.v = v;
    this.rot = rot;
    this.maxDist = maxDist;
    this.step = function(){
        this.x += v * Math.sin(this.rot);
        this.y += v * -Math.cos(this.rot);
    }
    this.isAtEnd = function(){
        var dx = this.x-this.initX;
        var dy = this.y-this.initY;
        return Math.sqrt(dx*dx+dy*dy) > this.maxDist;
    }
};


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
  this.isShooting = function() {
      return this.steer_data && this.steer_data.shot;
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
          if(this.steer_data.shot){
              var dx = Math.sin(this.rot);
              var dy = -Math.cos(this.rot);
              Game.shots.push(new Shot(this.id,this.x+dx*10, this.y+dy*10, 10, this.rot, 500));
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


var PaintEngine = function(canvas_context) {
  this.ctx = canvas_context;
  this.paint = function() {
      //this.ctx.fillStyle = 'rgb(0,0,0.6)';
      //this.ctx.fillRect(0,0,Game.w,Game.h);
  //    this.ctx.clearRect(0,0,Game.w, Game.h);
      this.ctx.drawImage(Images.bg,0,0);
      
      for (s in Game.ships)  this.paint_ship(Game.ships[s]);
      for (s in Game.shots)  this.paint_shot(Game.shots[s]);
  }
  this.paint_shot = function(shot){
      var c = this.ctx;
      c.fillStyle = 'rgba(0,255,255,0.5)';
      //c.stokeStyle = 'rgba(0,0,255,0.8)';
      //c.lineWidth = 1;
      c.fillRect(shot.x-1,shot.y-1,2,2);
      //c.strokeRect(shot.x-1,shot.y-1,2,2);
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
    if(ship.isShooting()){
        c.drawImage(Images.getShotImage(),13,-5);
    }
    
    c.restore();
  }
};
