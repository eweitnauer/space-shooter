var SubWave = function(timeOffset){
  this.timeOffset = timeOffset;
}

var Wave = function(level, timeSeconds, listOfSubWaves){
  this.level = level;
  this.timeSeconds = timeSeconds;
  this.listOfSubWaves;
  this.create_splash_screen = null;
  this.startTime = null;
}

Wave.prototye.start = function(){
  this.startTime = Animation.time;
  var dt = (Animation.time - this.startTime)/1000;
  while( a.length && (a[0].timeOffset < dt) ){
    this.spawn_sub_save(a[0]);
    a.shift();
  }
  if(!a.length) clearInterval
}



t0 = Date.now();
handle = setInterval(checkTimeline, 100);

console.log('hi there!')

function checkTimeline(t) {
  dt = Date.now()-t0;
  console.log('dt',dt)
  if (a[0][0] < dt/1000) {
    curr = a.shift();
    console.log(curr[1]);
    if (a.length==0) clearInterval(handle);
  }
}



