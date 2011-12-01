/// Passes the arguments to the contructor of the Animation class.
Sprite = function(timeline, img_tag) {
  this.x = 0;              // x position of sprite in image
  this.y = 0;              // y position of sprite in image
  this.rot = 0;            // rotation of sprite in image, in rad
  this.offset_x = 0;       // x offset when drawing the image, added to this.x
  this.offset_y = 0;       // y offset when drawing the image, added to this.y
  this.offset_rot = 0;     // rotation offset when drawing the image, added to this.rot, in rad.
  this.scale = 1;          // scaling of sprite and its child sprites
  this.alpha = 1;          // alpha of sprite (does not affect child sprites)
  this.alpha_decay = 0;    // exponential decay of alpha over animation frames
  this.extra_draw = null;  // custom draw method that is called after the sprite image is drawn
  this.child_sprites = []; // list of child sprites, those position and rotation is relative to this sprite
  this.animation = new Animation(timeline, imgs); // handles frame selection for animation
  this.draw_in_front_of_parent = true;  // should this sprite be drawn in front of it parent sprite?
  this.center_img = true;  // true: x,y is the center of the img / false: x,y is the upper left corner of the img
  this.display = true;     // should this sprite be displayed?
  this.hide_self_but_draw_children = false; // do we need this?
}

/** Params:
 *   timeline: Array of durations in ms describing how long each frame is shown.
 *             If a number is passed, each frame will be shown for that time. 
 *   img_tag: Image tag from ImageBank */
Animation = function(timeline, img_tag) {
  this._img = null;                  // image of N vertically stacked frames
  this._timeline = [];               // array of N frame durations in ms
  this._totalTime = 0;               // sum(timeline)
  this._last_time = Animation.time;  // used to calculate elapsed time since last call
  this._pause_time = Animation.time; // used to calculate since when the animation was paused
  this.delay_time = 0;               // time in ms to wait until first frame is shown
  this.running = true;               
  this.frame = 0;
  this.loop = true;
  this.finished_callback = null;
  this.finished = false;
  this.hide_after_finish = true;
  this.remove_after_finish = true;
  this.display = true;
  this.setAnimation(timeline, imgs);
}

Animation.time = 0;

Animation.prototype.reverse = function() {
  this._timeline.reverse();
  this._imgs.reverse();
}

Animation.prototype.setAnimation = function(timeline, imgs) {
  this._setImages(imgs);
  this.setTimeLine(timeline);
}

Animation.prototype._setImages = function(imgs) {
  this._imgs = [];
  if (typeof(imgs) == 'string' && imgs != '') {
    // get image array from image bank
    this._imgs = ImageBank.imgs[imgs].slice();
  } else if (typeof(imgs) == 'object' && 'slice' in imgs){
    // images passed as array already, just copy
    this._imgs = imgs.slice();
  }
}

Animation.prototype.setTimeLine = function(timeline) {
  this._timeline = [];
  this.frame = 0;
  this._last_time = Animation.time;
  if (typeof(timeline) == 'undefined') {
    this.setTimeLine(80);
  } else if (typeof(timeline) == 'number') {
    var l = this._imgs.length;
    this._totalTime = timeline * l;
    for (var i=0; i<l; ++i) this._timeline.push(timeline);
  } else {
    this._timeline = timeline;
    this._totalTime = 0;
    for (var i=0;i<timeline.length;++i) this._totalTime += timeline[i];
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
  if (this.frame >= this._timeline.length) {
    if (this.loop) this.frame = 0;
    else {
      if (this.finished_callback) {
        this.finished_callback(this);
      } else {
        this.stop();
        this.frame = this._timeline.length-1;
        if (this.hide_after_finish) this.display = false;
        this.finished = true;
      }
      return !this.finished;
    }
  }
  return true;
}

Animation.prototype.updateFrame = function() {
  if (!this.running) return;
  if (this.delay_time > 0) {
    this.delay_time -= Animation.time-this._last_time;
    this._last_time = Animation.time;
    return;
  }
  if (this._timeline.length < 2) return;
  var delta = Animation.time - this._last_time;
  delta = delta % this._totalTime;
  while (delta >= this._timeline[this.frame]) {
    delta -= this._timeline[this.frame];
    if (!this._incFrame()) return;
  }
  this._last_time = Animation.time - delta;
}

Animation.prototype.getCurrentImage = function() {
  if (!this.display) return null;
  if (!this._imgs) return null;
  this.updateFrame();
  if (this.delay_time>0) return null;
  return this._imgs[this.frame];
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
  if (img && !this.hide_self_but_draw_children) {
    ctx.save();
    ctx.translate(this.offset_x, this.offset_y);
    ctx.rotate(this.offset_rot);
    if (this.center_img) ctx.translate(-img.width/2, -img.height/2);
    var alpha = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha * Math.pow((1-this.alpha_decay),this.animation.frame);
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = alpha;
    ctx.restore();
  }
  
  // custom draw method
  if (this.extra_draw) this.extra_draw.call(this, ctx);

  // draw child sprites in front of this and delete finished ones
  var still_active_childs = [];
  this.child_sprites.forEach(function (child) {
    if (child.draw_in_front_of_parent) child.draw(ctx);
    if (!(child.animation.finished && child.animation.remove_after_finish))
      still_active_childs.push(child);
  });
  this.child_sprites = still_active_childs;
  
  ctx.restore();
}

ImageBank = {
  imgs: {}
  ,prefix: ''
  ,extension: '.png'
  ,get: function(tag) { return this.imgs[tag] }
  
  /// load('ship', './aship') will load the file ./aship.png into ImageBank.ship.
  /// Uses ImageBank.prefix and ImageBank.extension to build the file name. The
  /// 'frames' parameter specifies how many animation frames are stacked inside
  /// the image and is written to the 'frames' attribute of the image object. If
  /// not passed, it is set to 1.
  ,load: function(tag, url, frames) {
    if (arguments.length<3) var frames = 1
    this.imgs[tag] = new Image();
    this.imgs[tag].src = this.prefix + url + this.extension;
    this.imgs[tag].frames = count
  }
  
  /// Returns an array [#loaded_imgs, #total_imgs].
  ,getLoadedImgRatio: function() {
    var N = 0, loaded = 0;
    for (var i in this.imgs) {
      if (imageLoaded(this.imgs[i])) loaded++;
      N++;        
    }
    return [loaded, N];
  }
}

function imageLoaded(img) {
  if (!img.complete) {
    return false;
  }
  if (typeof img.naturalWidth != 'undefined' && img.naturalWidth== 0) {
    return false;
  }
  return true;
}

PaintEngine = function(canvas) {
  var self = this;
  this.sprites = []; // top-level sprites
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.draw_physics = false;
  this.draw_alien_sensors = false;
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
    if (self.draw_alien_sensors) {
      Game.aliens.forEach(function(alien) {
        if ('visualize_sensors' in alien) alien.visualize_sensors(self.context);
      });
    }
  } 
}
