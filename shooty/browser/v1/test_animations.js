var ctx, cell_size=100, w=1280, h=1000;
var sprites = [];

function init() {
  var canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  init_animations();
  setInterval(step, 1000/30);
};

function init_animations() {
  Animation.time = Date.now();
  solar_animation();
  var xcell = 2, ycell = 1;
  for (var img in ImageBank.imgs) {
    var sprite = new Sprite(80, img);
    sprite.x = xcell * cell_size;
    sprite.y = ycell * cell_size;
    xcell++;
    if (xcell*cell_size>w-cell_size*0.5) {
      xcell = 1;
      ycell++;
    }
    
    sprite.extra_draw = function(ctx) {
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(this.animation.img_tag,0,-40);
    }
    if(/material/.test(img)){
      var s = new Sprite;
      s.animation.finished = false;
      s.draw_in_front_of_parent = false;
      if(/one/.test(img)){
        s.extra_draw = function(ctx){
          ctx.fillStyle = 'rgb(230,230,230)';
          ctx.fillRect(-44,-44,88,88);
        }
      }else{
        s.extra_draw = function(ctx){
          ctx.fillStyle = 'rgb(230,230,230)';
          ctx.fillRect(-44,-44,88,88);
          //todo use animation.frame_change_callback!
          if(s.animation.frame == 20){
            //s.scale = 10;
          }else{
            //s.scale = 20;
          }
        }
      }
      sprite.child_sprites.push(s);
    }

    

//    if (img == 'alien_ufo') sprite.offset_rot = Math.PI*0.25;
//    if (/solar/.test(img)) {
//      sprite.animation.setTimeLine(120);
//    }
//    if (/sploing/.test(img)) {
//      sprite.animation.setTimeLine(sprite.animation._timeline.concat(500));
//    }
//    if (/expl/.test(img)) {
//      sprite.animation.setTimeLine(sprite.animation._timeline.concat(500));
//    }
//    if (/mine/.test(img)) {
//      setInterval(function() {sprite.offset_rot += Math.PI/90}, 1000/30);
//    }
//    if (/coin/.test(img)){
//      sprite.scale = 0.5;
//      sprite.animation.setTimeLine(120);
//    }
//    if (/star/.test(img)){
//      sprite.scale = 0.5;
//    }
//    if (/small-cube/.test(img)){
//      sprite.animation.setTimeLine(80);
//      sprite.scale = 0.5;
//    }
//    if (/large-cube/.test(img)){
//      sprite.animation.setTimeLine(120);
//      sprite.scale = 1.0;
//    }


//    if(/shop-background/.test(img)){
//      sprite.scale = 0.1;
//    }
    if(/bg/.test(img) || /shop/.test(img)){
      sprite.scale = 0.1;
    }
    
    sprites.push(sprite);
    
  }
}

function solar_animation() {
  // closing of solar panel
  var trigger_close = function(sprite) {
    sprite.animation.setAnimation(120, 'ship-solar-red', 'backward');
    sprite.animation.loop = false;
    sprite.animation.finished_callback = function() {
      // normal flying
      this.setAnimation(80, 'ship-red');
      this.loop = true;
      this.finished_callback = null;
    }
  }
  
  // opening of solar panel
  var trigger_open = function(sprite) {
    sprite.animation.setAnimation(120, 'ship-solar-red', 'forward');
    sprite.animation.loop = false;
    sprite.animation.finished_callback = function() {
      // keep panel open
      this.setAnimation(120, 'ship-solar-red-open');
      this.loop = true;
      this.finished_callback = null;
    }
  }
  
  var sprite = new Sprite(80, 'ship-red');
  setInterval(function() {
    trigger_close(sprite);
    setTimeout(function() {trigger_open(sprite)}, 2500);
  }, 5000);
  trigger_open(sprite);
  
  sprite.x = cell_size; sprite.y = cell_size;
  sprites.push(sprite);
}

function step() {
  Animation.time = Date.now();
  ctx.clearRect(0,0,w,h);
  sprites.forEach(function(s) {
    s.draw(ctx);
  });
}
