//ImageBank.prefix = 'http://phigames.com/demos/shooty/';
var global_ship_colors = ['red', 'yellow', 'purple', 'green', 'orange'];
global_ship_colors.forEach(function(color) {
  ImageBank.load_animation('ship_'+color, 'graphics/ship/ship-' + color + '-', 4);
  ImageBank.load_animation('ship_solar_'+color, 'graphics/ship/solar/ship-' + color + '-', 13);
  ImageBank.load_animation('ship_solar_open_'+color, 'graphics/ship/solar/ship-' + color + '-open-', 3);
});
ImageBank.load_single('ship_gray', 'graphics/ship/ship-gray-0');
ImageBank.load_animation('flame', 'graphics/effects/flame-', 3);
ImageBank.load_animation('large_flame', 'graphics/effects/very-large-flame-', 4);
ImageBank.load_animation('small_rocket_flame', 'graphics/effects/rocket-flame-', 4);
ImageBank.load_animation('canon', 'graphics/effects/muzzleflash-', 3);
ImageBank.load_animation('smoke', 'graphics/effects/smoke-', 4);
ImageBank.load_animation('smoke-large', 'graphics/effects/smoke-large-lighter-', 21);
ImageBank.load_animation('lighter-smoke-large', 'graphics/effects/lighter-smoke-large-', 30);
ImageBank.load_animation('lighter-smoke-large-colored', 'graphics/effects/lighter-smoke-large-colored-', 30);
ImageBank.load_animation('small-rocket-smoke', 'graphics/effects/small-rocket-smoke-', 12);
ImageBank.load_animation('very-small-rocket-smoke', 'graphics/effects/very-small-rocket-smoke-', 8);
ImageBank.load_animation('bullet', 'graphics/effects/bullet-', 3);
ImageBank.load_animation('big_explosion', 'graphics/effects/ship-explosion-', 28);
ImageBank.load_animation('huge_explosion', 'graphics/effects/very-large-explosion-', 26);
ImageBank.load_animation('med_explosion', 'graphics/effects/medium-explosion-', 11);
ImageBank.load_animation('small_explosion', 'graphics/effects/very-small-explosion-', 15);
ImageBank.load_animation('sploing_a', 'graphics/effects/a-sploing-', 4);
ImageBank.load_animation('sploing_b', 'graphics/effects/b-sploing-', 4);
ImageBank.load_single('background', 'graphics/bg');
ImageBank.load_single('shop-background', 'graphics/shop');

ImageBank.load_animation('alien_pyramid', 'graphics/aliens/pyramid-', 4);
ImageBank.load_animation('alien_ufo', 'graphics/aliens/ufo-', 3);
ImageBank.load_animation('alien_mine', 'graphics/aliens/mine-', 3);
ImageBank.load_animation('alien_rocket', 'graphics/aliens/rocket-', 6);
ImageBank.load_animation('alien_small_rocket', 'graphics/aliens/small-rocket-', 3);


