//ImageBank.prefix = 'http://phigames.com/demos/shooty/';
Ship.colors.forEach(function(color) {
  ImageBank.load_animation('ship_'+color, 'graphics/ship/ship-' + color + '-', 4);
  ImageBank.load_animation('ship_solar_'+color, 'graphics/ship/solar/ship-' + color + '-', 14);
});
ImageBank.load_single('ship_gray', 'graphics/ship/ship-gray-0');
ImageBank.load_animation('flame', 'graphics/effects/flame-', 3);
ImageBank.load_animation('canon', 'graphics/effects/muzzleflash-', 3);
ImageBank.load_animation('smoke', 'graphics/effects/smoke-', 4);
ImageBank.load_animation('bullet', 'graphics/effects/bullet-', 3);
ImageBank.load_animation('big_explosion', 'graphics/effects/ship-explosion-', 28);
ImageBank.load_animation('med_explosion', 'graphics/effects/medium-explosion-', 11);
ImageBank.load_single('background', 'graphics/bg');

ImageBank.load_animation('alien_pyramid', 'graphics/aliens/pyramid-', 4);
ImageBank.load_animation('alien_ufo', 'graphics/aliens/ufo-', 3);
ImageBank.load_animation('alien_mine', 'graphics/aliens/mine-', 3);

