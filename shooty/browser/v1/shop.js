function hit(geometry, x, y){
    return (geometry.x <= x && geometry.y <= y 
            && geometry.x + geometry.width >= x
            && geometry.y+geometry.height >= y);
}

var ShopButton = function(x,y,width,height,image){
    this.state = 'normal'; // 'normal', 'hovered', 'pressed', 'disabled'
    this.geometry = { x: x, y:y, width:width, height:height }; 


    this.mouse = function(x,y,pressed){
        if(this.state == 'disabled') return;
        if(hit(this.geometry,x,y)){
            this.state = pressed ? 'pressed' : 'hovered';
        }else{
            this.state = 'normal';
        }
    }
};

var Shop = {
    geometry: { x: 350, y: 135, width: 760, height: 500}
    ,painter: null
    ,main_sprite: null
    ,initPainter : function(){
        this.painter = new PaintEngine(document.getElementById("canvas"));
        this.main_sprite = new Sprite([],"shop-background");

//        this.main_sprite.child_sprites.push(shopBG);
        this.main_sprite.x = this.geometry.x;
        this.main_sprite.y = this.geometry.y;
        this.main_sprite.center_img = false;
        this.painter.add(this.main_sprite);
    }
    
    ,draw : function(ctx, ship){
        if (!this.painter) this.initPainter();   
        this.painter.draw();
        ctx.save();
        ctx.translate(Shop.geometry.x + 90, Shop.geometry.y + 70);
        ctx.rotate(0.01);
        ctx.strokeStyle = "rgb(255,0,0)";
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.font = '22px "Permanent Marker"';
        ctx.fillText('This is the shop for player '+ship.player_name, 0,0);
        ctx.restore();
    }
}