var WaveResultScreen = function(level,timeAvailable,timeNeeded,aliensLeft){
  this.level = level;
  this.timeAvailable = timeAvailable;
  this.timeNeeded = timeNeeded;
  this.aliensLeft = aliensLeft;
  this.init();
  this.end_callback = null;
}

WaveResultScreen.prototype.init = function() {
  jQuery.extend(this, new Sprite([], 'shop-background'));
  this.x = 720;
  this.y = 450;
  this.extra_draw = function(ctx){ this.splash_screen_draw(ctx); }
}
    
WaveResultScreen.prototype.splash_screen_draw = function(ctx){
  ctx.font = '30px "Permanent Marker"';
  ctx.translate(-260, -240);

  ctx.fillStyle = Colors.dark_gray;
  ctx.fillText('Result for WAVE ' + this.level, 1.5, 1.5);
  ctx.fillStyle = Colors.blue;
  ctx.fillText('Result for WAVE ' + this.level, 0, 0);
  ctx.fillStyle = Colors.gray;  
  
  
  ctx.font = '24px "Permanent Marker"';
  ctx.fillText('Time Available: ' + Math.round(this.timeAvailable) + 's',50,30);
  ctx.fillText('Time Needed: ' + Math.round(this.timeNeeded) + 's', 50,60);
  ctx.fillText('Aliens Left: ' + this.aliensLeft, 50,90);
}