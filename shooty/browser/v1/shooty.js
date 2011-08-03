var Explosion = function(shot_or_ship){
    var self = this;
    this.x = shot_or_ship.x;
    this.y = shot_or_ship.y;
    this.time = -1;
    this.isAtEnd = function(){
        return this.time >= 4;
    }
    this.step = function(){
        this.time++;
    }
};

var Shot = function(id,x,y,v,rot,maxDist){
    var self = this;
    this.id = id;
    this.initx = x;
    this.inity = y;
    this.x = x;
    this.y = y;
    this.v = v;
    this.hit = false;
    this.rot = rot;
    this.maxDist2 = maxDist*maxDist;
    this.step = function(){
        this.x += v * Math.sin(this.rot);
        this.y += v * -Math.cos(this.rot);
    }
    this.isAtEnd = function(){
        if(this.hit) return true;
        var dx = this.x-this.initX;
        var dy = this.y-this.initY;
        return dx*dx+dy*dy > this.maxDist2;
    }
};
