function hit(geometry, x, y){
    return (geometry.x <= x && geometry.y <= y 
            && geometry.x + geometry.width >= x
            && geometry.y + geometry.height >= y);
}

var ShopButton = function(x,y,x_offset,y_offset,image, parent_sprite, description){
    jQuery.extend(this, new Sprite([], image));
    this.name = image;
    this.description = description;
    this.state = 'normal'; // 'normal', 'hovered', 'pressed', 'disabled'
    this.x = x+x_offset;
    this.y = y+y_offset;
    this.click_x = x;
    this.click_y = y;
    this.normal_border = new Sprite([],"shop-button-normal");
    this.hovered_border = new Sprite([],"shop-button-hovered");
    this.pressed_border = new Sprite([],"shop-button-pressed");
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

    this.mouse = function(pressed, hit){
        var newState = hit ? (pressed ? 'pressed' : 'hovered') : 'normal';
        if(newState != this.state){
            this.state = newState;
            this.normal_border.display = (this.state == 'normal');
            this.hovered_border.display = (this.state == 'hovered');
            this.pressed_border.display = (this.state == 'pressed');
        }
    }
    console.log(parent_sprite);
    parent_sprite.child_sprites.push(this);
};


var Shop = {
    geometry: { x: 350, y: 135, width: 760, height: 500}
    ,painter: null
    ,main_sprite: null
    ,buttons: []
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
            c.mouse(type == 'down', hit(geometry,evt.x, evt.y));
        }
    }
    ,initPainter : function(){
        var canvas = document.getElementById("canvas");
        canvas.onmousemove = function(evt) { Shop.mouse(evt,'move') };
        canvas.onmousedown = function(evt) { Shop.mouse(evt,'down') };
        canvas.onmouseup = function(evt) { Shop.mouse(evt,'up') };

        this.painter = new PaintEngine(canvas);
        this.main_sprite = new Sprite([],"shop-background");

//        this.main_sprite.child_sprites.push(shopBG);
        this.main_sprite.x = this.geometry.x;
        this.main_sprite.y = this.geometry.y;
        this.main_sprite.center_img = false;
        this.painter.add(this.main_sprite);


        var x0 = 170;
        var y0 = 140;
        var dx = 180;
        var dy = 160;
        extras = ['health','accelleration','bullet-speed','life','shield',
                  'shot','shot-angle','shot-length','shot-steangth'];
        descriptions = [
            
        ];
        var yoffs = [0,-4,-2,-30,0,-6,-2,-2,-2];

        var idx = 0;
        for(var j = 0; j < 3 ; ++j){
            for(var i = 0; i < 3 ; ++i, ++idx){
                var b = new ShopButton(x0 + i * dx, y0 + j * dy, 0, yoffs[idx],'extra-'+extras[idx],
                                       this.main_sprite,descriptions[idx]);
                this.buttons.push(b);
            }
        }
    }
    
    ,draw : function(ctx, ship){
        if (!this.painter) this.initPainter();   
        this.painter.draw();
        ctx.save();
        ctx.translate(this.main_sprite.x, this.main_sprite.y);
        //      ctx.rotate(0.01);

        ctx.strokeStyle = "rgb(255,0,0)";
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.font = '12px "Permanent Marker"';
        for(var i=0;i<this.buttons.length; i++){
            var b = this.buttons[i];
            ctx.fillText(b.name,b.click_x-40, b.click_y+50);
        }

        ctx.restore();
    }
}