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
  this.animation = new Animation(timeline, img_tag); // handles frame selection for animation
  this.draw_in_front_of_parent = true;  // should this sprite be drawn in front of it parent sprite?
  this.center_img = true;  // true: x,y is the center of the img / false: x,y is the upper left corner of the img
  this.display = true;     // should this sprite be displayed?
  this.hide_self_but_draw_children = false; // do we need this?
}

/// Queries the animation for size, returns {width, height}.
Sprite.prototype.getImageSize = function() {
  if (this.animation._img == null) return {width:0, height:0};
  if (!this.animation._img.frame_height) this.animation._img.frame_height = this.animation._img.height / this.animation._img.frames;
  return {width:this.animation._img.width, height: this.animation._img.frame_height}
}

/** Params:
 *   timeline: Array of durations in ms describing how long each frame is shown.
 *             If a number is passed, each frame will be shown for that time.
 *   img_tag: Image tag from ImageBank, can be null */
Animation = function(timeline, img_tag) {
  this._img = null;                  // image of N vertically stacked frames, can be null
  this.img_tag = img_tag;            // ImageBank tag, read only
  this._timeline = [];               // array of N frame durations in ms
  this._totalTime = 0;               // sum(timeline)
  this._last_time = Animation.time;  // used to calculate elapsed time since last call
  this._pause_time = Animation.time; // used to calculate since when the animation was paused
  this.delay_time = 0;               // time in ms to wait until first frame is shown
  this.running = true;               // true if animation is running (not stopped or paused)
  this.frame = 0;                    // current frame
  this.direction = 1;                // 1: forward / -1: backward playing of frames
  this.loop = true;                  // if true, animation will start over when finished
  this.finished_callback = null;     // function that is called on finish (not if loop is true)
  this.finished = false;             // true if the animation has finished
  this.hide_after_finish = true;     // true: show nothing after finished / false: show last img after finish
  this.remove_after_finish = true;   // if true, parents will remove their finished child sprites on draw()
  this.display = true;               // should the animation be displayed?
  this.setAnimation(timeline, img_tag); // called on construction to setup timeline and img
  this.frame_change_callback = null; // if this is set to a function(frame), it is invoked with the next frame id
}

/// IMPORTANT
/// This is the place everybody should get its current time from. Must be set to
/// current time in the Game class before each drawing of the world.
Animation.time = 0;

/// Get number of frames.
Animation.prototype.frames = function() {
  return this._timeline.length;
}

/// direction can be 'forward' or 'backward', default value is 'forward'.
Animation.prototype.setAnimation = function(timeline, img_tag, direction) {
  if (typeof(img_tag) != 'undefined') {
    this._img = ImageBank.get(img_tag)
  }
  this.setTimeLine(timeline);
  if (arguments.length<3) direction = 'forward';
  if (direction == 'backward') {
    this.frame = this._timeline.length-1;
    this.direction = -1;
  } else {
    this.frame = 0;
    this.direction = 1;
  }
}

Animation.prototype.setTimeLine = function(timeline) {
  this._timeline = [];
  this.frame = 0;
  this._last_time = Animation.time;
  if (typeof(timeline) == 'undefined') timeline = 80;
  if (typeof(timeline) == 'number') {
    var N = this._img ? this._img.frames : 0
    this._totalTime = N * timeline;
    for (var i=0; i<N; ++i) this._timeline.push(timeline);
  } else {
    var N = timeline.length;
    this._timeline = timeline;
    this._totalTime = 0;
    for (var i=0;i<N;++i) this._totalTime += timeline[i];
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
  this.frame += this.direction;
  if (this.frame >= this._timeline.length) if (this.loop) this.frame = 0;
  if (this.frame < 0) if (this.loop) this.frame = this._timeline.length-1;
  
  if (this.frame >= this._timeline.length || this.frame < 0) {
    if (this.finished_callback) {
      this.finished_callback(this);
    } else {
      this.stop();
      this.frame = this.direction > 0 ? this._timeline.length-1 : 0;
      if (this.hide_after_finish) this.display = false;
      this.finished = true;
    }
    if(this.frame_change_callback) this.frame_change_callback(this.frame);
    return !this.finished;
  }
  if(this.frame_change_callback) this.frame_change_callback(this.frame);
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

/// Returns whether the animation has something to display.
/// If it returns true, it will have called updateFrame.
Animation.prototype.hasCurrentImage = function() {
  this.updateFrame();
  if (this.delay_time>0) return false;
  if (!this.display) return false;
  if (!this._img) return false;
  return true;
}

/// You should call updateFrame() before.
Animation.prototype.drawCurrentImage = function(ctx, center_img) {
  if (!this._img.frame_height) this._img.frame_height = this._img.height / this._img.frames;
  if (center_img) {
    var dx = -this._img.width/2;
    var dy = -this._img.frame_height/2;
  } else var dx=0, dy=0;
  ctx.drawImage(this._img, 0, this.frame*this._img.frame_height,
                this._img.width, this._img.frame_height,
                dx, dy, this._img.width, this._img.frame_height);
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
  if (!this.hide_self_but_draw_children && this.animation.hasCurrentImage()) {
    ctx.save();
    ctx.translate(this.offset_x, this.offset_y);
    ctx.rotate(this.offset_rot);
    var alpha = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha * Math.pow((1-this.alpha_decay),this.animation.frame);
    this.animation.drawCurrentImage(ctx, this.center_img);
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
    this.imgs[tag].frames = frames
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

PaintEngine = function(fg_canvas, bg_canvas) {
  var self = this;
  this.last_time = 0;
  this.sprites = []; // top-level sprites
  this.fps = 0;
  this.fg = fg_canvas;
  this.fg_context = fg_canvas.getContext('2d');
  this.bg = bg_canvas;
  this.bg_context = bg_canvas.getContext('2d');
  this.draw_physics = false;
  this.draw_alien_sensors = false;
  this.add = function(sprite) { this.sprites.push(sprite); }
  this.undraw = function() {
    self.fg_context.clearRect(0,0,self.fg.width, self.fg.height);
  }
  this.draw = function() {
    self.undraw();
    self.sprites.forEach(function(sprite) {
      if (sprite.is_background) sprite.draw(self.bg_context);
      else sprite.draw(self.fg_context);
    });
    if (self.draw_physics) {
      self.fg_context.strokeStyle = 'blue';   
      for (var i=0; i<Game.lines.length; ++i) {
        self.fg_context.beginPath();
        self.fg_context.moveTo(Game.lines[i].A.x, Game.lines[i].A.y);
        self.fg_context.lineTo(Game.lines[i].B.x, Game.lines[i].B.y);
        self.fg_context.stroke();
      }
    }
    if (self.draw_alien_sensors) {
      Game.aliens.forEach(function(alien) {
        if ('visualize_sensors' in alien) alien.visualize_sensors(self.fg_context);
      });
    }
  }
  
  this.fps_buf = 0;
  this.show_fps = function(tasks) {
    self.fg_context.fillStyle = 'white';
    self.fg_context.fillRect(500, 180, 100, 100);
    var now = Date.now();
    self.fg_context.fillStyle = Colors.gray;
    self.fg_context.font = '15px "Arial"';
    fps = 1000/(now-self.last_time);
    this.fps = 0.99*this.fps+0.01*fps;
    self.last_time = now
    self.fg_context.fillText('fps: '+Math.round(this.fps), 500, 200);
    var i=1
    for (t in tasks) {
      i++;
      self.fg_context.fillText(t+': '+tasks[t].toFixed(1)+' ms', 500, 200+i*20);
    }
  } 
}
