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
    explosions: [new Image, new Image, new Image, new Image],
    bg: new Image
};
Images.ship.src = 'graphics/ship-30x30.png';
Images.bg.src = 'graphics/bg.jpg';

Images.flames[0].src = 'graphics/flame-neu-1.png';    
Images.flames[1].src = 'graphics/flame-neu-2.png';    
Images.flames[2].src = 'graphics/flame-neu-3.png';    
Images.shots[0].src = 'graphics/shot-neu-1.png';    
Images.shots[1].src = 'graphics/shot-neu-2.png';    
Images.shots[2].src = 'graphics/shot-neu-3.png';    

Images.explosions[0].src = 'graphics/boom-1.png';    
Images.explosions[1].src = 'graphics/boom-2.png';    
Images.explosions[2].src = 'graphics/boom-3.png';    
Images.explosions[3].src = 'graphics/boom-4.png';    


var PaintEngine = function(canvas_context) {
  this.ctx = canvas_context;
  this.paint = function() {
      //this.ctx.fillStyle = 'rgb(0,0,0.6)';
      //this.ctx.fillRect(0,0,Game.w,Game.h);
  //    this.ctx.clearRect(0,0,Game.w, Game.h);
      this.ctx.drawImage(Images.bg,0,0);
      
      for (s in Game.ships)  this.paint_ship(Game.ships[s]);
      for (s in Game.shots)  this.paint_shot(Game.shots[s]);
      for (e in Game.explosions)  this.paint_explosion(Game.explosions[e]);
  }

  this.paint_explosion = function(ex){
      var c = this.ctx;
      var im = Images.explosions[ex.time];
      c.drawImage(im,ex.x-im.width/2,ex.y-im.height/2);
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