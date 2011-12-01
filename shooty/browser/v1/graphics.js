//ImageBank.prefix = 'http://phigames.com/demos/shooty/';

load_images = function(type,list){
  for(var i in list){
    var name = i, len = list[i];
    ImageBank.load_animation(type+'-'+list[i],'graphics/'+type+'/'+name, len);
  }
}


load_images('alien',{'amoeba':18,
                     'amoeba-division':13,
                     'fighter':4,
                     'mine':3,
                     'pyramid':4,
                     'rocket':6, 
                     'small-rocket':3,
                     'ufo':3,
                     'small-yellow-box':3,
                     'yellow-box':3});

load_images('bullet',{'0':3,
                      '1':3,
                      '2':3
                      '3':3,
                      '4':3,
                      '5':3
                      '6':3,
                      'spark-0':3,
                      'spark-1':3,
                      'rocket':3});

load_images('explosion',{'blast':7,
                         'green':13,
                         'L':26,
                         'M':11,
                         'S':15,
                         'ship':28,
                         'sploing-a':4,
                         'sploing-b':4
                        });


load_images('extra',{ 'acceleration':1,
                      'bullet-speed':1,
                      'button-hovered':1,
                      'button-normal':1,
                      'button-pressed':1,
                      'coin':7,
                      'health':1,
                      'life':1,
                      'recharge':1,
                      'rocket':1,
                      'rotation-speed':1,
                      'shield':1,
                      'shot':1,
                      'shot-angle':1,
                      'shot-length':1,
                      'shot-streangth':1,
                      'stars-0':1,
                      'stars-1':1,
                      'stars-2':1,
                      'stars-3':1,
                      'stars-4':1,
                      'stars-5':,
                      'x-hovered':1,
                      'x-normal':1,
                      'x-pressed':1});

load_images('flame',{ 'L':3,
                      'M':3,
                      'rocket':4,
                      'XL':4,
                      'muzzleflash':3 });

var global_ship_colors = ['red', 'yellow', 'purple', 'green', 'orange'];
for (var i=0; i< global_ship_colors.length;++i){
  var c = global_ship_colors[i];
  load_images('ship',{c:}]);
}




//var global_ship_colors = ['red', 'yellow', 'purple', 'green', 'orange'];
//global_ship_colors.forEach(function(color) {
//  ImageBank.load_animation('ship_'+color, 'graphics/ship/ship-' + color + '-', 4);
//  ImageBank.load_animation('ship_solar_'+color, 'graphics/ship/solar/ship-' + color + '-', 13);
//  ImageBank.load_animation('ship_solar_open_'+color, 'graphics/ship/solar/ship-' + color + '-open-', 3);
//});
//ImageBank.load_single('ship_gray', 'graphics/ship/ship-gray-0');
//ImageBank.load_animation('flame', 'graphics/effects/flame-', 3);
//ImageBank.load_animation('large_flame', 'graphics/effects/very-large-flame-', 4);
//ImageBank.load_animation('small_rocket_flame', 'graphics/effects/rocket-flame-', 4);
//ImageBank.load_animation('canon', 'graphics/effects/muzzleflash-', 3);
//ImageBank.load_animation('smoke', 'graphics/effects/smoke-', 4);
//ImageBank.load_animation('smoke-large', 'graphics/effects/smoke-large-lighter-', 21);
//ImageBank.load_animation('lighter-smoke-large', 'graphics/effects/lighter-smoke-large-', 30);
//ImageBank.load_animation('lighter-smoke-large-colored', 'graphics/effects/lighter-smoke-large-colored-', 30);
//ImageBank.load_animation('small-rocket-smoke', 'graphics/effects/small-rocket-smoke-', 12);
//ImageBank.load_animation('very-small-rocket-smoke', 'graphics/effects/very-small-rocket-smoke-', 8);
//ImageBank.load_animation('bullet', 'graphics/effects/bullet-', 3);
//ImageBank.load_animation('big_explosion', 'graphics/effects/ship-explosion-', 28);
//ImageBank.load_animation('huge_explosion', 'graphics/effects/very-large-explosion-', 26);
//ImageBank.load_animation('med_explosion', 'graphics/effects/medium-explosion-', 11);
//ImageBank.load_animation('small_explosion', 'graphics/effects/very-small-explosion-', 15);
//ImageBank.load_animation('green_explosion', 'graphics/effects/green-splash-', 13);
//ImageBank.load_animation('sploing_a', 'graphics/effects/a-sploing-', 4);
//ImageBank.load_animation('sploing_b', 'graphics/effects/b-sploing-', 4);
//ImageBank.load_single('background', 'graphics/bg');
//ImageBank.load_single('shop-background', 'graphics/shop');

//ImageBank.load_animation('alien_pyramid', 'graphics/aliens/pyramid-', 4);
//ImageBank.load_animation('alien_ufo', 'graphics/aliens/ufo-', 3);
//ImageBank.load_animation('alien_mine', 'graphics/aliens/mine-', 3);
//ImageBank.load_animation('alien_rocket', 'graphics/aliens/rocket-', 6);
//ImageBank.load_animation('alien_small_rocket', 'graphics/aliens/small-rocket-', 3);
//ImageBank.load_animation('alien_fighter', 'graphics/aliens/fighter-', 4);

//ImageBank.load_single('shop-button-normal', 'graphics/extras/extra-button-normal-3');
//ImageBank.load_single('shop-button-hovered', 'graphics/extras/extra-button-hovered-3');
//ImageBank.load_single('shop-button-pressed', 'graphics/extras/extra-button-pressed-3');

//ImageBank.load_single('extra-shot', 'graphics/extras/extra-shot');
//ImageBank.load_single('extra-bullet-speed', 'graphics/extras/extra-bullet-speed');
//ImageBank.load_single('extra-acceleration', 'graphics/extras/extra-acceleration');
//ImageBank.load_single('extra-health', 'graphics/extras/extra-health');
//ImageBank.load_single('extra-life', 'graphics/extras/extra-life');
//ImageBank.load_single('extra-shield', 'graphics/extras/extra-shield');
//ImageBank.load_single('extra-shot', 'graphics/extras/extra-shot');
//ImageBank.load_single('extra-shot-angle', 'graphics/extras/extra-shot-angle');
//ImageBank.load_single('extra-shot-length', 'graphics/extras/extra-shot-length');
//ImageBank.load_single('extra-shot-steangth', 'graphics/extras/extra-shot-streangth');
//ImageBank.load_single('extra-recharge-speed', 'graphics/extras/extra-recharge');
//ImageBank.load_single('extra-rotation-speed', 'graphics/extras/extra-rotation-speed');
//ImageBank.load_single('extra-rocket', 'graphics/extras/extra-rocket');

//ImageBank.load_animation('coin', 'graphics/extras/coin-', 7);
//ImageBank.load_animation('coin-2', 'graphics/extras/coin-', 7);

//ImageBank.load_single('star-gray', 'graphics/extras/star-gray');
//ImageBank.load_single('star-gold', 'graphics/extras/star-gold');


//ImageBank.load_single('zero-stars', 'graphics/extras/zero-stars');
//ImageBank.load_single('one-stars', 'graphics/extras/one-stars');
//ImageBank.load_single('two-stars', 'graphics/extras/two-stars');
//ImageBank.load_single('three-stars', 'graphics/extras/three-stars');
//ImageBank.load_single('four-stars', 'graphics/extras/four-stars');
//ImageBank.load_single('five-stars', 'graphics/extras/five-stars');

//ImageBank.load_single('x-normal', 'graphics/extras/x-normal');
//ImageBank.load_single('x-hovered', 'graphics/extras/x-hovered');
//ImageBank.load_single('x-pressed', 'graphics/extras/x-pressed');


//ImageBank.load_animation('boom-blast', 'graphics/effects/boom-blast-', 7);

//ImageBank.load_animation('bullet-0', 'graphics/bullets/bullet-level-0-', 3);
//ImageBank.load_animation('bullet-1', 'graphics/bullets/bullet-level-1-', 3);
//ImageBank.load_animation('bullet-2', 'graphics/bullets/bullet-level-2-', 3);
//ImageBank.load_animation('bullet-3', 'graphics/bullets/bullet-level-3-', 3);
//ImageBank.load_animation('bullet-4', 'graphics/bullets/bullet-level-4-', 3);
//ImageBank.load_animation('bullet-5', 'graphics/bullets/bullet-level-5-', 3);
//ImageBank.load_animation('bullet-6', 'graphics/bullets/bullet-level-6-', 3);

//ImageBank.load_animation('bullet-4-spark', 'graphics/bullets/bullet-level-4-spark-', 3);
//ImageBank.load_animation('bullet-5-spark', 'graphics/bullets/bullet-level-5-spark-', 3);
//ImageBank.load_animation('bullet-6-spark', 'graphics/bullets/bullet-level-5-spark-', 3);

//ImageBank.load_animation('player-rocket', 'graphics/player-rocket/player-rocket-', 3);

//ImageBank.load_animation('alien-large-cube', 'graphics/aliens/cube-',24);
//ImageBank.load_animation('alien-small-cube', 'graphics/aliens/cube-',24);


//ImageBank.load_animation('alien-yellow-box', 'graphics/aliens/yellow-box-',3);
//ImageBank.load_animation('alien-small-yellow-box', 'graphics/aliens/small-yellow-box-',3);


//ImageBank.load_animation('alien-amoeba-anim', 'graphics/aliens/amoeba-anim-',13);
//// this one is rotating for some strange reason ..
//ImageBank.load_animation('alien-amoeba', 'graphics/aliens/amoeba-',18);

