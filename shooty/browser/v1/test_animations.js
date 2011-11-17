var ctx, cell_size=100, w=1280, h=800;
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
    if (img == 'background') continue;
    var sprite = new Sprite(80, img);
    sprite.x = xcell * cell_size;
    sprite.y = ycell * cell_size;
    xcell++;
    if (xcell*cell_size>w-cell_size*0.5) {
      xcell = 1;
      ycell++;
    }
    if (img == 'alien_ufo') sprite.offset_rot = Math.PI*0.25;
    if (/solar/.test(img)) {
      sprite.animation.setTimeLine(120);
    }
    if (/sploing/.test(img)) {
      sprite.animation.setTimeLine(sprite.animation._timeLine.concat(500));
    }
    if (/expl/.test(img)) {
      sprite.animation.setTimeLine(sprite.animation._timeLine.concat(500));
    }
    if (/mine/.test(img)) {
      setInterval(function() {sprite.offset_rot += Math.PI/90}, 1000/30);
    }
    if (/coin/.test(img)){
      sprite.scale = 0.5;
      sprite.animation.setTimeLine(120);
    }
    if (/star/.test(img)){
      sprite.scale = 0.5;
    }

    if(/shop-background/.test(img)){
      sprite.scale = 0.1;
    }
    sprites.push(sprite);
  }
}

function solar_animation() {
  // closing of solar panel
  var trigger_close = function(sprite) {
    sprite.animation.setAnimation(120, 'ship_solar_red');
    sprite.animation.reverse();
    sprite.animation.loop = false;
    sprite.animation.finished_callback = function() {
      // normal flying
      this.setAnimation(80, 'ship_red');
      this.loop = true;
      this.finished_callback = null;
    }
  }
  
  // opening of solar panel
  var trigger_open = function(sprite) {
    sprite.animation.setAnimation(120, 'ship_solar_red');
    sprite.animation.loop = false;
    sprite.animation.finished_callback = function() {
      // keep panel open
      this.setAnimation(120, 'ship_solar_open_red');
      this.loop = true;
      this.finished_callback = null;
    }
  }
  
  var sprite = new Sprite(80, 'ship_red');
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
