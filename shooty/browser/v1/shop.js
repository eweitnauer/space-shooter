function hit(geometry, x, y){
  return (geometry.x <= x && geometry.y <= y 
          && geometry.x + geometry.width >= x
          && geometry.y + geometry.height >= y);
}

var ShopButton = function(x,y,x_offset,y_offset,image, parent_sprite, name){
  this.isExtra = image ? true : false;
  jQuery.extend(this, image ? new Sprite([], image) : new Sprite([]));
  this.name = name;
  this.state = 'normal'; // 'normal', 'hovered', 'pressed', 'disabled'
  this.x = x+x_offset;
  this.y = y+y_offset;
  this.click_x = x;
  this.click_y = y;
  var prefix = image ? 'shop-button-' : 'x-';

  
  this.normal_border = new Sprite([],prefix+'normal');
  this.hovered_border = new Sprite([],prefix+'hovered');
  this.pressed_border = new Sprite([],prefix+'pressed');

  this.normal_border.draw_in_front_of_parent = false;
  this.hovered_border.draw_in_front_of_parent = false;
  this.pressed_border.draw_in_front_of_parent = false;
  
  this.child_sprites.push(this.normal_border);
  this.child_sprites.push(this.hovered_border);
  this.child_sprites.push(this.pressed_border);

  this.normal_border.offset_x = -x_offset;
  this.normal_border.offset_y = -y_offset;

  this.hovered_border.offset_x = -x_offset;
  this.hovered_border.offset_y = -y_offset;

  this.pressed_border.offset_x = -x_offset;
  this.pressed_border.offset_y = -y_offset;

  this.normal_border.display = true;
  this.hovered_border.display = false;
  this.pressed_border.display = false;

  this.normal_border.scale = 1.1;
  this.hovered_border.scale = 1.1;
  this.pressed_border.scale = 1.1;

  this.mouse = function(pressed, hit){
    var newState = hit ? (pressed ? 'pressed' : 'hovered') : 'normal';
    if(newState != this.state){
      this.state = newState;
      this.normal_border.display = (this.state == 'normal');
      this.hovered_border.display = (this.state == 'hovered');
      this.pressed_border.display = (this.state == 'pressed');
    }
  }
  parent_sprite.child_sprites.push(this);

  
};


var Shop = {
  geometry: { x: 350, y: 135, width: 760, height: 500}
  ,painter: null
  ,main_sprite: null
  ,buttons: []
  ,extras: null
  ,ship: null
  ,mouse : function(evt,type){
    var x = this.main_sprite.x;
    var y = this.main_sprite.y;
    for(var i=0;i<this.buttons.length; i++){
      var c = this.buttons[i];
      var size = c.isExtra ? c.getImageSize() : {width:20, height :20};
      var geometry = { x: x+c.click_x-size.width/2, 
                       y: y+c.click_y-size.height/2,
                       width: size.width,
                       height: size.height };
      var hitVal = hit(geometry,evt.offsetX, evt.offsetY);
      var pressed = type == 'down';
      c.mouse(pressed, hitVal);
      
      if(hitVal && pressed){
        if(c.isExtra){
          var level = this.extras.levels[c.name];
          var costs = (this.name == 'health' ? this.ship.max_energy - this.ship.energy :
                       this.extras.costs[c.name][level]);
          
          if((level < 5 || name=='life')  && Game.coins >= costs){
            if(this.name != 'health') this.extras.levels[c.name]++;
            this.ship.update_from_extra(c.name);
            Game.coins -= costs;
          }
        }else{
          Game.leaveShop();
        }
      }
    }
  }
  ,initPainter : function(){
    var canvas = document.getElementById("canvas");
    canvas.onmousemove = function(evt) { Shop.mouse(evt,'move') };
    canvas.onmousedown = function(evt) { Shop.mouse(evt,'down') };
    canvas.onmouseup = function(evt) { Shop.mouse(evt,'up') };

    this.painter = new PaintEngine(canvas);
    this.main_sprite = new Sprite([],"shop-background");

    this.main_sprite.x = this.geometry.x;
    this.main_sprite.y = this.geometry.y;
    this.main_sprite.center_img = false;
    this.painter.add(this.main_sprite);


    var x0 = 170;
    var y0 = 180;
    var dx = 180;
    var dy = 160;
    extras = new Extras().names;
    //['health','acceleration','bullet-speed','life','shield',
    //          'shot','shot-angle','shot-length','shot-steangth'];
    var yoffs = [0,-4,-2,0,0,-6,-2,-2,-2];

    var idx = 0;
    for(var j = 0; j < 3 ; ++j){
      for(var i = 0; i < 3 ; ++i, ++idx){
        var b = new ShopButton(x0 + i * dx, y0 + j * dy, 0, yoffs[idx],'extra-'+extras[idx],
                               this.main_sprite, extras[idx]);
        this.buttons.push(b);
      }
    }
    
    this.x_button = new ShopButton(x0-80, y0-150, 0, 0, null, this.main_sprite, null);
    this.buttons.push(this.x_button);
  }
  
  ,setup: function(ctx, ship) {
    this.ship = ship;
    this.ctx = ctx;
    this.ready_for_close = false;
    this.extras = ship.extras;
    this.star_sprites = [
      new Sprite(80,'zero-stars'),
      new Sprite(80,'one-stars'),
      new Sprite(80,'two-stars'),
      new Sprite(80,'three-stars'),
      new Sprite(80,'four-stars'),
      new Sprite(80,'five-stars')
    ];
    this.coin = new Sprite(120,'coin');
    this.coin.scale = 0.5;
    this.large_coin = new Sprite(120,'coin');
    this.ship_sprite = new Sprite(80,'ship_'+this.ship.color);
    this.ship_sprite.scale = 1.5;
//    this.ship_sprite.rot = Math.PI/2;

    if (!this.painter) this.initPainter();   
  }
  
  ,draw : function() {
    this.painter.draw();
    this.ctx.save();
    this.ctx.translate(this.main_sprite.x, this.main_sprite.y);
    this.ctx.fillStyle = "rgb(100,100,100)";
    this.ctx.font = '22px "Permanent Marker"';
    this.ctx.fillText('Shop for Player ' + this.ship.player_name,150,88);
    
    this.ctx.save();
    this.ctx.translate(120,80);
    this.ship_sprite.draw(this.ctx);
    this.ctx.restore();
    
    this.ctx.save();
    this.ctx.translate(530,80);
    this.large_coin.draw(this.ctx);
    this.ctx.fillText('' + Game.coins,20,8);
    this.ctx.restore();
    
    
    
    this.ctx.font = '16px "Permanent Marker"';
    var dy = 16;
    var x0 = -40;
    var y0 = 44;
    for(var i=0;i<this.buttons.length; i++){
      this.ctx.fillStyle = "rgb(100,100,100)";
      var b = this.buttons[i];
      if(!b.isExtra) continue;
      this.ctx.fillText(b.name,b.click_x+x0, b.click_y-y0);
      var level = this.ship.extras.levels[b.name];
      var costs = (b.name == 'health' ? this.ship.max_energy-this.ship.energy : 
                   this.ship.extras.costs[b.name][level]);
      if(level < 5){
        this.ctx.fillText('next:',b.click_x+x0, b.click_y+y0 + dy);

        if(costs > Game.coins){
          this.ctx.fillStyle = "rgb(255,0,0)";
        }
        this.ctx.fillText('' + costs ,b.click_x+x0+70, b.click_y+y0 + dy);
        this.ctx.save();
        this.ctx.translate(b.click_x+x0+60, b.click_y+y0-6 + dy);
        this.coin.draw(this.ctx)      
        this.ctx.restore();
      }else{
        this.ctx.fillStyle = "rgb(255,120,50)";
        this.ctx.fillText('max. level',b.click_x+x0, b.click_y+y0 + dy);

        this.ctx.fillStyle = "rgb(255,240,50)";
        this.ctx.fillText('max. level',b.click_x+x0-1, b.click_y+y0 + dy-1);

      }
      if(b.name != 'health' && b.name != 'life'){
        this.ctx.save();
        this.ctx.translate(b.click_x+55,b.click_y);
        this.star_sprites[Math.min(level,5)].draw(this.ctx);
        this.ctx.restore();
      }

    }

    this.ctx.restore();
  }
}
