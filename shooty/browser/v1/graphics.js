//ImageBank.prefix = 'http://phigames.com/demos/shooty/';
Ship.colors.forEach(function(color) {
  ImageBank.load_animation('ship_'+color, 'graphics/ship/colored/ship_' + color + '_', 0, 3, 1);
});
ImageBank.load_animation('ship_gray', 'graphics/ship/ship_', 0, 3, 1);
ImageBank.load_animation('shot', 'graphics/ship/shot2_', 0, 2, 1);
ImageBank.load_animation('smoke', 'graphics/smoke-', 1, 4, 1);
ImageBank.load_animation('flame', 'graphics/flame-neu-', 1, 3, 1);
ImageBank.load_animation('canon', 'graphics/shot-neu-', 1, 3, 1);
ImageBank.load_animation('explosion', 'graphics/explosion/', 1, 11, 2);
ImageBank.load_animation('solar', 'graphics/animation_solar/solar_', 0, 8, 2);
ImageBank.load_single('background', 'graphics/background-final-2');
