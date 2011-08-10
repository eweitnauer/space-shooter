var Images = {
    explosions: [new Image, new Image, new Image, new Image,
                 new Image, new Image, new Image, new Image],

    smokes: [ new Image, new Image, new Image, new Image,
              new Image, new Image, new Image, new Image],
    bg: new Image
};

ImageBank.extension = '.png';
for (color in Ship.colors) {
  ImageBank.load_single(Ship.colors[color], 'graphics/ship_' + Ship.colors[color]);
}
ImageBank.load_animation('flame', 'graphics/flame-neu-', 1, 3, 1);
ImageBank.load_animation('canon', 'graphics/shot-neu-', 1, 3, 1);
ImageBank.extension = '.jpg';
ImageBank.load_single('background', 'graphics/bg3');

Images.bg.src = 'graphics/bg3.jpg';

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
    Game.main_sprite.draw(this.ctx);
    //this.ctx.drawImage(Images.bg,0,0);
    //this.ctx.fillStyle = 'black';
    //this.ctx.fillRect(0,0,Game.w, Game.h);
    //for (s in Game.ships)  Game.ships[s].draw(this.ctx);
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
    if (ex.time < 0) return;
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
};
