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
    explosions: [new Image, new Image, new Image, new Image,
                 new Image, new Image, new Image, new Image],

    smokes: [ new Image, new Image, new Image, new Image,
              new Image, new Image, new Image, new Image],
    bg: new Image
};
Images.ship.src = 'graphics/ship-30x30.png';
Images.bg.src = 'graphics/bg3.jpg';

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
Images.explosions[4].src = 'graphics/smoke-1.png';    
Images.explosions[5].src = 'graphics/smoke-2.png';    
Images.explosions[6].src = 'graphics/smoke-3.png';    
Images.explosions[7].src = 'graphics/smoke-4.png';    

Images.smokes[0].src = 'graphics/smoke-1.png';    
Images.smokes[1].src = 'graphics/smoke-1.png';    
Images.smokes[2].src = 'graphics/smoke-2.png';    
Images.smokes[3].src = 'graphics/smoke-2.png';    
Images.smokes[4].src = 'graphics/smoke-3.png';    
Images.smokes[5].src = 'graphics/smoke-3.png';    
Images.smokes[6].src = 'graphics/smoke-4.png';    
Images.smokes[7].src = 'graphics/smoke-4.png';    


var PaintEngine = function(canvas_context) {
  this.ctx = canvas_context;
  this.paint = function() {
      this.ctx.drawImage(Images.bg,0,0);
      //this.ctx.fillStyle = 'black';
      //this.ctx.fillRect(0,0,Game.w, Game.h);
      for (s in Game.ships)  this.paint_ship(Game.ships[s]);
      for (s in Game.shots)  this.paint_shot(Game.shots[s]);
      for (e in Game.explosions)  this.paint_explosion(Game.explosions[e]);
      for (s in Game.smokes) this.paint_smoke(Game.smokes[s]);
      this.paint_info_bar();
  }
  
  this.paint_info_bar = function() {
    var c = this.ctx;
    c.fillStyle = 'black';
    c.fillRect(0,Game.h,Game.w,Game.info_bar_h);

    c.font = "bold 12 px sans";
    c.textBaseline = "middle";
    c.textAlign = "left";
    c.fillStyle = 'white';
    c.fillText('Join game with session code ' + Game.next_session_code, 10, Game.h+Game.info_bar_h/2);
  }

  this.paint_explosion = function(ex){
      var c = this.ctx;
      var im = Images.explosions[ex.time];
      c.drawImage(im,ex.x-im.width/2,ex.y-im.height/2);
  }

  this.paint_smoke = function(s){
      var c = this.ctx;
      var im = Images.smokes[s.time];
      c.globalAlpha = 0.3;
      c.drawImage(im,s.x-im.width/2,s.y-im.height/2);
      c.globalAlpha = 1.0;
  }
  
  this.paint_shot = function(shot){
      var c = this.ctx;
      c.fillStyle = 'rgba(0,255,255,0.4)';
      //c.stokeStyle = 'rgba(0,0,255,0.8)';
      //c.lineWidth = 1;
      c.fillRect(shot.x-2,shot.y-2,4,4);
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
        c.drawImage(Images.getShotImage(),11,-10);
    }
    c.fillStyle = 'rgba(0,255,0,0.5)';
    //c.fillRect(0,30,20,7);

    c.beginPath();
    c.translate(Images.ship.width/2,Images.ship.height/2);
    c.arc(0,0,30,2*Math.PI*(ship.energy/100),0,true);
    c.lineWidth = 5;
    c.strokeStyle = 'rgba(200,255,0,0.5)';
    c.stroke();
    c.closePath();
    c.restore();
  }
};
