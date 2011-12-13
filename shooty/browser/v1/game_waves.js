create_wave = function(level){
  var end_cb = function(waveResult){
    console.log("wave " + waveResult.level + " finished: " + waveResult.result);
  }
  var time = 60, subwaves = [], aliendefs = {}, title = "no title", description = "no description";
  
  switch(level){
  case 1:
    time = 60;
    subwaves = [new SubWave(5,5,'fighter'), 
                new SubWave(30,5,'fighter'),
                new SubWave(35,1,'ufo'), 
                new SubWave(35,1,'box')];
    aliendefs = {fighter: new AlienDefinition(function(){ new Fighter(); },'alien-fighter',10,10,'none'),
                 ufo: new AlienDefinition(function(){ new Ufo(); },'alien-ufo',50,100,'none'),
                 box: new AlienDefinition(function(){ new YellowBox},'alien-yellow-box',20,200,'none') };
    title = "Hello Shooty!";
    description = "The End is nigh, quick! kill all the aliens";
    break;
  case 2:
    break;

  case 3:
    break;

  case 4:
    break;

  case 5:
    break;

  case 6:
    break;

  case 7:
    break;

  case 8:
    break;

  case 9:
    break;

  case 10:
    break;
  }
  return new Wave(level,time, subwaves, aliendefs, end_cb, "Hello Shooty!","The End is nigh, quick! kill all the aliens");

}