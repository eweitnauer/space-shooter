var SubWave = function(timeOffset, numAliens, alienID){
  this.timeOffset = timeOffset;
  this.numAliens = numAliens;
  this.alienID = alienID;
}
var WaveResult = function(level,result){
  this.level = level;
  this.result = result;
}

var AlienDefinition = function(create, sprite_name, attack, defense, specials){
  this.create = create;
  this.sprite_name = sprite_name;
  this.attack = attack;
  this.defense = defense;
  this.specials = specials;
}


/// alienDefinitionMap is of type { id : AlienDefinition, ... }
var Wave = function(level, timeSeconds, listOfSubWaves, alienDefinitionMap, waveEndCallback, waveTitle, waveDescription){
  this.level = level;
  this.timeSeconds = timeSeconds;
  this.listOfSubWaves = listOfSubWaves;
  this.alienDefinitionMap = alienDefinitionMap;
  this.waveTitle = waveTitle;
  this.waveDescription = waveDescription;
  this.startTime = null;
  this.timerHandle = null;
  this.waveEndCallback = waveEndCallback;

  this.numAliens = 0; // altered by the aliens themselfes
}

Wave.prototype.spawn_sub_wave = function(subwave){
 // console.log("spawn_sub_wave searching for " + subwave.alienID);
 // console.log("map is ",this.alienDefinitionMap);
  var def = this.alienDefinitionMap[subwave.alienID];
  if(typeof(def) == 'undefined'){
    console.log('Wave: ' + this.level +': unable to spawn alien with id ' + subwave.alienID );
    return;
  }
  for(var i=0;i<subwave.numAliens;++i){
    def.create();
  }
}

Wave.prototype.create_splash_screen = function(){
  var counts = {};
  for(i in  this.alienDefinitionMap){
    counts[i] = 0;
  }
  for(var i=0;i<this.listOfSubWaves.length;++i){
    var sub = this.listOfSubWaves[i];
    counts[ sub.alienID ] += sub.numAliens;
    
  }
  var entries = [];
  for(i in  this.alienDefinitionMap){
    var def = this.alienDefinitionMap[i];
    entries.push(new SplashEntry(def.sprite_name, counts[i], def.attack, def.defense, def.specials ));
  }              
  var splash = new SplashScreen(this.level, entries, this.timeSeconds, this.waveTitle, this.waveDescription);
  var self = this;
  splash.end_callback = function(){ self.start(); }
  return splash;
}

Wave.prototype.start = function(){
  var self = this;
  this.startTime = Animation.time;
  this.timerHandle = setInterval(function(){ self.check_time_line();},100);
}

Wave.prototype.check_time_line = function(){
  var dt = (Animation.time - this.startTime)/1000;
  var self = this;
  while( self.listOfSubWaves.length && (self.listOfSubWaves[0].timeOffset < dt) ){
//    console.log("spawning new subwave !");
    self.spawn_sub_wave(self.listOfSubWaves[0]);
    self.listOfSubWaves.shift();
  }
  if(!self.numAliens && !self.listOfSubWaves.length){
    clearInterval(self.timerHandle);
    self.waveEndCallback(new WaveResult(self.level,'all aliens were killed'));
  }
  if( dt > self.timeSeconds ){
    clearInterval(self.timerHandle);
    self.waveEndCallback(new WaveResult(self.level,'wave ended before all aliens were killed'));
  }
}



