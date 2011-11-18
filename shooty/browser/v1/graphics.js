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

ImageBank.load_single('shop-button-normal', 'graphics/extras/extra-button-normal-3');
ImageBank.load_single('shop-button-hovered', 'graphics/extras/extra-button-hovered-3');
ImageBank.load_single('shop-button-pressed', 'graphics/extras/extra-button-pressed-3');

ImageBank.load_single('extra-shot', 'graphics/extras/extra-shot');
ImageBank.load_single('extra-bullet-speed', 'graphics/extras/extra-bullet-speed');
ImageBank.load_single('extra-acceleration', 'graphics/extras/extra-acceleration');
ImageBank.load_single('extra-health', 'graphics/extras/extra-health');
ImageBank.load_single('extra-life', 'graphics/extras/extra-life');
ImageBank.load_single('extra-shield', 'graphics/extras/extra-shield');
ImageBank.load_single('extra-shot', 'graphics/extras/extra-shot');
ImageBank.load_single('extra-shot-angle', 'graphics/extras/extra-shot-angle');
ImageBank.load_single('extra-shot-length', 'graphics/extras/extra-shot-length');
ImageBank.load_single('extra-shot-steangth', 'graphics/extras/extra-shot-streangth');
ImageBank.load_single('extra-recharge-speed', 'graphics/extras/extra-recharge');
ImageBank.load_single('extra-rotation-speed', 'graphics/extras/extra-rotation-speed');
ImageBank.load_single('extra-rocket', 'graphics/extras/extra-rocket');

ImageBank.load_animation('coin', 'graphics/extras/coin-', 7);
ImageBank.load_animation('coin-2', 'graphics/extras/coin-', 7);

ImageBank.load_single('star-gray', 'graphics/extras/star-gray');
ImageBank.load_single('star-gold', 'graphics/extras/star-gold');


ImageBank.load_single('zero-stars', 'graphics/extras/zero-stars');
ImageBank.load_single('one-stars', 'graphics/extras/one-stars');
ImageBank.load_single('two-stars', 'graphics/extras/two-stars');
ImageBank.load_single('three-stars', 'graphics/extras/three-stars');
ImageBank.load_single('four-stars', 'graphics/extras/four-stars');
ImageBank.load_single('five-stars', 'graphics/extras/five-stars');

ImageBank.load_single('x-normal', 'graphics/extras/x-normal');
ImageBank.load_single('x-hovered', 'graphics/extras/x-hovered');
ImageBank.load_single('x-pressed', 'graphics/extras/x-pressed');


ImageBank.load_animation('boom-blast', 'graphics/effects/boom-blast-', 7);

ImageBank.load_animation('bullet-0', 'graphics/bullets/bullet-level-0-', 3);
ImageBank.load_animation('bullet-1', 'graphics/bullets/bullet-level-1-', 3);
ImageBank.load_animation('bullet-2', 'graphics/bullets/bullet-level-2-', 3);
ImageBank.load_animation('bullet-3', 'graphics/bullets/bullet-level-3-', 3);
ImageBank.load_animation('bullet-4', 'graphics/bullets/bullet-level-4-', 3);
ImageBank.load_animation('bullet-5', 'graphics/bullets/bullet-level-5-', 3);

ImageBank.load_animation('bullet-4-spark', 'graphics/bullets/bullet-level-4-spark-', 3);
ImageBank.load_animation('bullet-5-spark', 'graphics/bullets/bullet-level-5-spark-', 3);

ImageBank.load_animation('player-rocket', 'graphics/player-rocket/player-rocket-', 3);

ImageBank.load_single('star-gold-rotating', 'graphics/extras/star-gold');
