var SplashEntry = function(sprite_name,count, attack, defense, specials){
  this.sprite = new Sprite(80,sprite_name);
  if(sprite_name == 'alien-ufo'){
    this.sprite.offset_rot = Math.PI*0.25;    // rotate imgs by 45 deg.
    this.sprite.offset_x = this.offset_y = 3
  }
  this.count = count;
  this.attack = attack;
  this.defense = defense;
  this.specials = specials;
  this.draw = function(ctx){
    this.sprite.draw(ctx);
    // todo draw the texts ...
  }
}


var SplashScreen = function(wave, entries){
  // default are just for debugging and development
  if(typeof(wave) == 'undefined') var wave = 42;
  if(typeof(entries) == 'undefined'){
    var entries = [new SplashEntry('alien-ufo',10,100,80,'shield, fast'), 
                   new SplashEntry('alien-fighter',5,40,10,''), 
                   new SplashEntry('alien-mine',45,10,60,'invincible')];
  }
  this.wave = wave;
  this.entries = entries;
  this.init();
}

SplashScreen.prototype.init = function() {
  jQuery.extend(this, new Sprite([], 'shop-background'));
  this.x = 720;
  this.y = 450;
  this.extra_draw = function(ctx){ this.splash_screen_draw(ctx); }
  this.layout_entries();
}
    
SplashScreen.prototype.splash_screen_draw = function(ctx){
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.drawStyle = "rgb(0,0,0)";
  ctx.font = '22px "Permanent Marker"';
  ctx.translate(-230, -240);
  ctx.fillText('WAVE ' + this.wave, 0, 0);

  this.entries.forEach(function(e){ e.draw(ctx); });
}

SplashScreen.prototype.layout_entries = function(){
  // todo: find something more general ...
  if(this.entries.length == 3){
    this.entries[0].sprite.x = 30;
    this.entries[0].sprite.y = 50;

    this.entries[1].sprite.x = 180;
    this.entries[1].sprite.y = 50;

    this.entries[2].sprite.x = 330;
    this.entries[2].sprite.y = 50;
  }
  // look at entries and set
}



