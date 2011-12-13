var WaveInfoEntry = function(sprite_name, count, attack, defense, specials){
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
    var xOffs = -20, yOffs = 30, yStep = 25;
    ctx.save();
    ctx.translate(this.sprite.x, this.sprite.y);

    ctx.font = '24px "Permanent Marker"';
    ctx.fillStyle = Colors.gray;
    ctx.fillText('x ' + this.count, 35,0),
    

    ctx.font = '14px "Permanent Marker"';
    ctx.fillStyle = Colors.gray;
    ctx.fillText('attack:  ' + this.attack, xOffs, yOffs);
    ctx.fillText('defense: ' + this.defense, xOffs, yOffs+yStep);
    if(typeof(this.specials) != 'undefined' && this.specials != ''){
      ctx.fillText('special: ' + this.specials, xOffs, yOffs+2*yStep);
    }
    
    ctx.restore();
  }
}


var WaveInfoScreen = function(wave, entries,timeSeconds, text_title, text){
  // default are just for debugging and development
  if(typeof(wave) == 'undefined') var wave = 42;
  if(typeof(timeSeconds) == 'undefined') var timeSeconds = 125;
  if(typeof(entries) == 'undefined'){
    var entries = [new WaveInfoEntry('alien-ufo',10,100,80,'shield, fast'), 
                   new WaveInfoEntry('alien-fighter',5,40,10,''), 
                   new WaveInfoEntry('alien-mine',45,10,60,'invincible'),
                   new WaveInfoEntry('alien-amoeba',100,100,80,'crazy, strong'), 
                   new WaveInfoEntry('alien-yellow-box',1,40,10,'yellow'), 
                   new WaveInfoEntry('alien-rocket',33,10,60,'smoking,happy')
                  ];
  }
  
  if(typeof(text_title) == 'undefined') var text_title = 'A new Hope ...';
  if(typeof(text) == 'undefined') var text = ( "It is a period of civil war. Rebel spaceships, striking from a hidden base,\n"+
                                               "have won their first victory against the evil Galactic Empire. During the\n"+
                                               "battle, Rebel spies managed to steal secret plans to the Empire’s ultimate\n"+
                                               "weapon, the DEATH STAR, an armored space station with enough power to destroy\n"+
                                               "an entire planet. Pursued by the Empire’s sinister agents, Princess Leia races\n"+
                                               "home aboard her starship, custodian of the stolen plans that can save her people\n"+
                                               "and restore freedom to the galaxy...");
  //
  this.wave = wave;
  this.entries = entries;
  this.timeSeconds = timeSeconds;
  this.text_lines = text.split('\n');
//  console.log(this.text_lines);
  this.text_title = text_title;
  this.init();
  this.end_callback = null;
}

WaveInfoScreen.prototype.init = function() {
  jQuery.extend(this, new Sprite([], 'shop-background'));
  this.x = 720;
  this.y = 450;
  this.extra_draw = function(ctx){ this.splash_screen_draw(ctx); }
  this.layout_entries();
}
    
WaveInfoScreen.prototype.splash_screen_draw = function(ctx){
  ctx.font = '30px "Permanent Marker"';
  ctx.translate(-260, -240);

  ctx.fillStyle = Colors.dark_gray;
  ctx.fillText('WAVE ' + this.wave, 1.5, 1.5);
  ctx.fillStyle = Colors.blue;
  ctx.fillText('WAVE ' + this.wave, 0, 0);
  ctx.fillStyle = Colors.gray;  

  var minutes = Math.floor(this.timeSeconds/60);
  var seconds = (this.timeSeconds-60*minutes);
  ctx.font = '20px "Permanent Marker"';
  ctx.fillText('Time: ' + minutes + ':' + (seconds < 10 ? '0' : '' ) + seconds,350,0);

  this.entries.forEach(function(e){ e.draw(ctx); });


  ctx.fillText(this.text_title, 0,332)
  ctx.font = '14px "Permanent Marker"';
  
  var lineYStep = 20;
  var lineYOffs = 350;
  for(var i=0;i<this.text_lines.length; ++i){
    ctx.fillText(this.text_lines[i], 0,lineYOffs + i* lineYStep)
  }
  
}

WaveInfoScreen.prototype.layout_row = function(yOffs,entries){
  var n = entries.length;
//  console.log(n);
  var xOffs = n==1 ? 200 : n==2 ? 100 : 30;
  var xStep = n==1 ? 0 : n==2 ? 250 : 180;
  for(var i=0;i<n;++i){
    entries[i].sprite.x = xOffs + xStep * i;
    entries[i].sprite.y = yOffs;
    //console.log('row entry ' + i + ' at (' + entries[i].sprite.x+','+entries[i].sprite.y+')' );
  }
}

WaveInfoScreen.prototype.layout_entries = function(){
  // max 3 per row

  var currentRow = 0;
  var yOffs = 70;
  var yStep = 140;

  var entries = this.entries.slice();

  while(entries.length){
    var n = Math.min(3,entries.length);
    //console.log('row ', currentRow, ' has ',n, ' entries');
    var row = entries.splice(0,n);
   // console.log('remaining entries ', entries.length);
    this.layout_row(yOffs + currentRow*yStep, row);

    currentRow ++;
  }
  // look at entries and set
}



