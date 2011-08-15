Sprite = function(timeLine, imgs) {
  this.x = 0;
  this.y = 0;
  this.offset_x = 0;
  this.offset_y = 0;
  this.rot = 0;
  this.scale = 1;
  this.alpha = 1;
  this.extra_draw = null;
  this.child_sprites = [];
  this.animation = new Animation(timeLine, imgs);
  this.draw_in_front_of_parent = true;
  this.center_img = true;
  this.display = true;
}

/** Params:
  *   timeLine: array of milliseconds describing how long each frame is shown
  *   imgs: name of image tag from ImageBank or array of images */
Animation = function(timeLine, imgs) {
  this._imgs = imgs;
  this._timeLine = [];
  this._totalTime = 0;
  this._last_time = Animation.time;
  this._pause_time = Animation.time;
  this.delay_time = 0; /// time in ms to wait until first frame is shown
  this.running = true;
  this.frame = 0;
  this.loop = true;
  this.finished_callback = null;
  this.finished = false;
  this.display = true;
  this.setTimeLine(timeLine);
}

Animation.time = 0;

Animation.prototype.setTimeLine = function(timeLine) {
  this._timeLine = [];
  this.frame = 0;
  this._last_time = Animation.time;
  if (typeof(timeLine) == 'undefined') {
    this.setTimeLine(80);
  } else if (typeof(timeLine) == 'number') {
    var l = (typeof(this._imgs) == 'string') ? ImageBank.imgs[this._imgs].length : this._imgs.length;
    this._totalTime = timeLine * l;
    for (var i=0; i<l; ++i) this._timeLine.push(timeLine);
  } else {
    this._timeLine = timeLine;
    this._totalTime = 0;
    for (var i=0;i<timeLine.length;++i) this._totalTime += timeLine[i];
  }
}

Animation.prototype.pause = function() {
  if (!this.running) return;
  this.updateFrame();
  this._pause_time = Animation.time;
  this.running = false;
}

Animation.prototype.play = function() {
  if (this.running) return;
  this.running = true;
  this._last_time += Animation.time - this._pause_time;
  this.updateFrame(); 
}

Animation.prototype.stop = function() {
  this.frame = 0;
  this._pause_time = this._last_time = Animation.time;
  this.running = false;
}

Animation.prototype.step = function() {
  this._last_time = Animation.time;
  this._incFrame();
}

/// Returns false if the animation is finished.
Animation.prototype._incFrame = function() {
  this.frame++;
  if (this.frame >= this._timeLine.length) {
    if (this.loop) this.frame = 0;
    else {
      if (this.finished_callback) this.finished_callback(this);
      this.stop();
      this.frame = -1;
      this.display = false;
      this.finished = true;
      return false;
    }
  }
  return true;
}

Animation.prototype.updateFrame = function() {
  if (!this.running) return;
  if (this._timeLine.length < 2) return;
  var delta = Animation.time - this._last_time;
  delta = delta % this._totalTime;
  while (delta >= this._timeLine[this.frame]) {
    delta -= this._timeLine[this.frame];
    if (!this._incFrame()) return;
  }
  this._last_time = Animation.time - delta;
}

Animation.prototype.getCurrentImage = function() {
  if (this.delay_time > 0) {
    this.delay_time -= Animation.time-this._last_time;
    this._last_time = Animation.time;
    return null;
  }
  else {this.delay_time = 0};
  if (!this.display) return null;
  if (!this._imgs) return null;
  this.updateFrame();
  if (typeof(this._imgs) == 'string') {
    return ImageBank.get(this._imgs, this.frame)
  } else return this._imgs[this.frame];
}

/// draws the sprite and all child sprites on the passed canvas context
Sprite.prototype.draw = function(ctx) {
  if (typeof(this.display) == 'function') { if (!this.display()) return; }
  else if (!this.display) return;
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.rot);
  ctx.scale(this.scale, this.scale);
  
  // draw child sprites
  this.child_sprites.forEach(function (child) {
    if (!child.draw_in_front_of_parent) child.draw(ctx);
  });
  
  // draw self
  var img = this.animation.getCurrentImage();
  if (img) {
    if (this.center_img) ctx.translate(-img.width/2+this.offset_x, -img.height/2+this.offset_y);
    var alpha = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = alpha;
    if (this.center_img) ctx.translate(img.width/2-this.offset_x, img.height/2-this.offset_y);
  }
  
  // custom draw method
  if (this.extra_draw) this.extra_draw.call(this, ctx);

  // draw child sprites in front of this and delete finished ones
  var still_active_childs = [];
  this.child_sprites.forEach(function (child) {
    if (child.draw_in_front_of_parent) child.draw(ctx);
    if (!child.animation.finished) still_active_childs.push(child);
  });
  this.child_sprites = still_active_childs;
  
  ctx.restore();
}

ImageBank = {
  imgs: {}
 ,prefix: ''
 ,extension: '.png'
 ,get: function(tag, number) {
    if (!(tag in this.imgs)) return null;
    var num = (typeof(number) == 'undefined') ? 0 : number;
    return this.imgs[tag][num];
  }
 /// load_animation('ship', './ship') will load the file ./ship.png 
 ,load_single: function(tag, url) {
  this.imgs[tag] = [new Image()];
  this.imgs[tag][0].src = this.prefix + url + this.extension;
 }
 /// load_animation('ship', './ship', 1, 3, 2) will load the files
 /// ./ship01.png ./ship02.png and /./ship03.png
 ,load_animation: function(tag, url, from, to, len) {
  this.imgs[tag] = [];
  for (var i=from; i<=to; i++) {
    var img = new Image();
    var num = String(i); while (num.length < len) num = '0'+num;
    img.src = this.prefix + url + num + this.extension;
    this.imgs[tag].push(img);
  }
 } 
}

PaintEngine = function(canvas) {
  var self = this;
  this.sprites = []; // top-level sprites
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.draw_physics = false;
  this.add = function(sprite) { this.sprites.push(sprite); }
  this.draw = function() {
    this.sprites.forEach(function(sprite) {
      sprite.draw(self.context);
    });
    if (self.draw_physics) {
      self.context.strokeStyle = 'blue';   
      for (var i=0; i<Game.lines.length; ++i) {
        self.context.beginPath();
        self.context.moveTo(Game.lines[i].A.x, Game.lines[i].A.y);
        self.context.lineTo(Game.lines[i].B.x, Game.lines[i].B.y);
        self.context.stroke();
      }
    }
  } 
}
