var SubWave = function(timeOffset){
  this.timeOffset = timeOffset;
}

var Wave = function(level, timeSeconds, listOfSubWaves){
  this.level = level;
  this.timeSeconds = timeSeconds;
  this.listOfSubWaves;
  this.create_splash_screen = null;
}
