create_wave = function(level){
  var end_cb = function(waveResult){
    console.log("wave " + waveResult.level + " finished: " + waveResult.result);
  }
  var time = 60, subwaves = [], aliendefs = {}, title = "no title", description = "no description";
  
  switch(level){
  case 1:
    time = 50;
    subwaves = [//new SubWave(2,20,'fighter'), 
                new SubWave(3,4,'pyramid'), 
                new SubWave(5,2,'fighter'), 
                new SubWave(10,2,'fighter'),
                new SubWave(12,2,'ufo'), 
                new SubWave(10,1,'box')];
    aliendefs = {fighter: new AlienDefinition(function(){ new Fighter(); },'alien-fighter',10,10,'none'),
                 ufo: new AlienDefinition(function(){ new Ufo(); },'alien-ufo',50,100,'none'),
                 box: new AlienDefinition(function(){ new YellowBox},'alien-yellow-box',20,200,'none'),
                 pyramid: new AlienDefinition(function(){ new Pyramid},'alien-pyramid',20,200,'none'),
                };
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