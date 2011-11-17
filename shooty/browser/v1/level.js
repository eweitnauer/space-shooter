var Level = function(level_code, greetings, minedropper, rocketdropper, sx, sy, fx,fy) {
  // Set the level ID 
  this.levelid = level_code;
  // Set the level
  this.greetings = greetings;
  // How many mine and rocketdroppers do we have to spawn?
  this.minedropper =  mindedropper;
  this.rocketdropper = rocketdropper; 
  // start position
  this.startx =  sx;
  this.starty = sy;
  // where has the player to go? aka endposition
  this.finishx = fx;
  this.finishy = fy;

  this.greeted = 0;
  this.init_done = 0;
  this.started = 0;
}

Level.prototype.step = function(){

  //if this.init_done 

}


Level.prototype.greeter = function(){
  
  // display(this.greetings);

} 
