function hit(geometry, x, y){
    return (geometry.x <= x && geometry.y <= y 
            && geometry.x + geometry.width >= x
            && geometry.y + geometry.height >= y);
}

var ShopButton = function(x,y,x_offset,y_offset,image, parent_sprite, name){
    jQuery.extend(this, new Sprite([], image));
    this.name = name;
    this.state = 'normal'; // 'normal', 'hovered', 'pressed', 'disabled'
    this.x = x+x_offset;
    this.y = y+y_offset;
    this.click_x = x;
    this.click_y = y;
    this.normal_border = new Sprite([],"shop-button-normal");
    this.hovered_border = new Sprite([],"shop-button-hovered");
    this.pressed_border = new Sprite([],"shop-button-pressed");

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
            var size = c.getImageSize();
            var geometry = { x: x+c.click_x-size.width/2, 
                             y: y+c.click_y-size.height/2,
                             width: size.width,
                             height: size.height };
            var hitVal = hit(geometry,evt.offsetX, evt.offsetY);
            var pressed = type == 'down';
            c.mouse(pressed, hitVal);
            
            if(hitVal && pressed){
                this.extras.levels[c.name]++;
                this.ship.update_from_extra(c.name);
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
        var y0 = 140;
        var dx = 180;
        var dy = 160;
        extras = new Extras().names;
        //['health','acceleration','bullet-speed','life','shield',
        //          'shot','shot-angle','shot-length','shot-steangth'];
        var yoffs = [0,-4,-2,-30,0,-6,-2,-2,-2];

        var idx = 0;
        for(var j = 0; j < 3 ; ++j){
            for(var i = 0; i < 3 ; ++i, ++idx){
                var b = new ShopButton(x0 + i * dx, y0 + j * dy, 0, yoffs[idx],'extra-'+extras[idx],
                                       this.main_sprite, extras[idx]);
                this.buttons.push(b);
            }
        }
    }
    
    ,setup: function(ctx, ship) {
      this.ship = ship;
      this.ctx = ctx;
      this.ready_for_close = false;
      this.extras = ship.extras;
      this.star_sprites = [new Sprite(80,'star-gray'),new Sprite(80,'star-gold')];
        this.star_sprites[0].scale = this.star_sprites[1].scale = 0.4;
      if (!this.painter) this.initPainter();   
    }
    
    ,draw : function() {
     this.painter.draw();
     this.ctx.save();
     this.ctx.translate(this.main_sprite.x, this.main_sprite.y);
     this.ctx.strokeStyle = "rgb(255,0,0)";
     
        this.ctx.font = '14px "Permanent Marker"';
        var dy = 16;
        var x0 = -40;
        var y0 = 54;
        for(var i=0;i<this.buttons.length; i++){
            this.ctx.fillStyle = "rgb(255,0,0)";
            var b = this.buttons[i];
            this.ctx.fillText(b.name,b.click_x+x0, b.click_y+y0);
            var level = this.ship.extras.levels[b.name];
            var costs = this.ship.extras.costs[b.name][level];
            if(level == 0){
                this.ctx.fillStyle = "rgb(100,100,100)";
            }else if(level < 4){
                this.ctx.fillStyle = "rgb(0,200,0)";
            }else{
                this.ctx.fillStyle = "rgb(255,0,0)";
            }
            this.ctx.fillText('level: ' + (level+1) + '/5',b.click_x+x0, b.click_y+y0 + 1*dy);
            this.ctx.fillText('update: ' + costs + '$',b.click_x+x0, b.click_y+y0 + 2*dy);

            this.ctx.save();
            this.ctx.translate(b.click_x+55,b.click_y+35);
            for(var j=0;j<5;++j){
                this.star_sprites[(j >= level) ? 0 : 1].draw(this.ctx);
                this.ctx.translate(0,-16);
            }
            this.ctx.restore();
        }

        this.ctx.restore();
    }
}
