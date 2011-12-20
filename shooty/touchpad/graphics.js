//ImageBank.prefix = 'http://phigames.com/demos/shooty/';


load_images = function(type,list){
  for(var i in list){
    var name = i, len = list[i];
    ImageBank.load(type+'-'+name,'graphics/'+type+'/'+name, len);
  }
}


load_images('alien',{
//  'amoeba':18,
//  'amoeba-division':13,
  'fighter':4,
//  'mine':3,
//  'pyramid':4,
//  'rocket':6, 
//  'small-rocket':3,
//  'ufo':3,
//  'small-yellow-box':3,
//  'cannon':3,
//  'cannon-pipe':1,
//  'yellow-box':3
});

load_images('overlay',{
  'accel':1,
  'fire':1,
  'rotate':1
});

load_images('bullet',{
  '0':3,
  '1':3,
  '2':3,
  '3':3,
  '4':3,
//  '5':3,
//  '6':3,
//  'rocket':3
});

load_images('explosion',{
//  'blast':7,
//  'green':13,
  'XL':15,
  'L':26,
  'M':11,
  'S':15,
  'ship':28,
  'sploing-a':4,
  'sploing-b':4,
//  'shield-sploing':7
});


/*
load_images('extra',{ 
  'acceleration':1,
  'bullet-speed':1,
  'button-hovered':1,
  'button-normal':1,
  'button-pressed':1,
  'coin':7,
  'health':1,
  'life':1,
  'recharge-speed':1,
  'rocket':1,
  'rotation-speed':1,
  'shield':1,
  'shot':1,
  'shot-angle':1,
  'shot-length':1,
  'shot-strength':1,
  'stars-0':1,
  'stars-1':1,
  'stars-2':1,
  'stars-3':1,
  'stars-4':1,
  'stars-5':1,
  'x-hovered':1,
  'x-normal':1,
  'x-pressed':1
});
*/

load_images('flame',{ 'L':3,
                      'M':3,
                      'rocket':4,
                      'XL':4,
                      'muzzleflash':3 });

/*
load_images('smoke',{'0':30,
                     '1':30,
                     '2':4,
                     '3':21,
                     '4':21,
                     '5':7,
                     'spark-0':3,
                     'spark-1':3,
                     'rocket-S':13,
                     'rocket-XS':8});
*/

//load_images('shield',{'1':3});

var global_ship_colors = ['red', 'yellow', 'purple', 'green', 'orange'];
for (var i=0; i< global_ship_colors.length;++i){
  var c = global_ship_colors[i];
  var list = {}; 
  list[c] = 4;
  list['solar-'+c] = 13;
  list['solar-'+c+'-open'] = 3;
  load_images('ship',list);
}

ImageBank.load('bg','graphics/bg',1);
ImageBank.load('shop-background','graphics/shop',1);
