var ctx;
var timer;
var bar1, bar2, ball;

var W = 800;
var H = 400;

var BARW = W/8;
var BARH = H/40;
var BAR_SPEED = 12;
var BAR_DIST_TO_BORDER = 10;
var BAR_TO_BALL_FRICTION = 0.15;

var BALLSPEED=8;
var BALLR=12;

var points_1 = 0;
var points_2 = 0;

var TEXT_HEIGHT=30;

function Bar(x,y,l,r,fill,stroke){
    var self = this;
    self.speed = 0;
    self.x = x;
    self.y = y;
    self.l = l;
    self.r = r;
    self.fill = fill;
    self.stroke = stroke;

    self.key_down = function(code){
        if(code == self.l) self.speed = -BAR_SPEED;
        else if(code == self.r) self.speed = BAR_SPEED;
    }
    self.key_up = function(code){
        if(code == self.l || code == self.r) self.speed = 0;
    }
    
    self.step = function(){
        self.x += self.speed;
        if(self.x < 0) self.x = 0;
        if(self.x > W-BARW) self.x = W-BARW;
    }

    self.draw = function(){
        ctx.fillStyle = self.fill;

        ctx.fillRect(self.x,self.y,BARW,BARH);
        ctx.beginPath();
        ctx.moveTo(self.x, self.y);
        ctx.lineTo(self.x+BARW, self.y);
        ctx.lineTo(self.x+BARW, self.y+BARH);
        ctx.lineTo(self.x, self.y+BARH);
        ctx.lineTo(self.x,self.y);
        ctx.closePath();

        ctx.strokeStyle = self.stroke;
        ctx.lineWidth = 2;
        
        ctx.stroke();
    }
    self.hit = function(x){
        if(x>self.x && x < self.x+BARW) return true; // use BALLW as well
        else return false
    }
}

function win(barIndex){
    if(barIndex == 1) points_1++;
    else points_2++;

    ball = new Ball(W/2,H/2,0,BALLSPEED,"#666","#444");
}

function Ball(x,y,vx,vy,fill,stroke){
    var self = this;
    var winner = 0;
    self.x = x;
    self.y = y;
    self.vx = vx; // random side, some angle -> right speed
    self.vy = vy;
    self.fill = fill;
    self.stroke = stroke;

    var minh = BAR_DIST_TO_BORDER+BARH+BALLR;
    var maxh = H-(BAR_DIST_TO_BORDER+BARH+BALLR);

    self.step = function(){
        if(winner == 0){
            var nx = self.x+self.vx;
            var ny = self.y+self.vy;
            if(nx < 0 || nx > W-BALLR) self.vx = -self.vx;
            if(ny < minh){
                if(bar1.hit(self.x)){
                    self.vy = -self.vy;
                    self.vx += bar1.speed * BAR_TO_BALL_FRICTION;
                }else{
                    winner=2;
                }
                
            }
            if(ny > maxh){
                if(bar2.hit(self.x)){
                    self.vy = -self.vy;
                    self.vx += bar2.speed * BAR_TO_BALL_FRICTION;

                }else{
                    winner=1;
                }
            }
            self.x += self.vx;
            self.y += self.vy;
        }else{
            self.x += self.vx;
            self.y += self.vy;
            if(self.y < -2*BALLR || self.y > H+2*BALLR){
                win(winner);
            }
        }

    }
    self.draw = function(){
        ctx.beginPath();
        ctx.arc(self.x,self.y,BALLR,0,Math.PI*2, true);
        ctx.closePath();
        ctx.fillStyle = self.fill;
        ctx.strokeStyle = self.stroke;
        ctx.lineWidth = 2;
      
    }
}

bar1 = new Bar(W/2,BAR_DIST_TO_BORDER,37,39,
               "rgb(200,100,100)","rgb(150,50,50)"); // left,right
bar2 = new Bar(W/2-20,H-BARH-BAR_DIST_TO_BORDER,65,83,
               "rgb(50,100,230)","rgb(0,50,180)"); // a,s
ball = new Ball(W/2,H/2,0,BALLSPEED,"#666","#444");

function key_down(evt) {
    bar1.key_down(evt.keyCode);
    bar2.key_down(evt.keyCode);
}

function key_up(evt) {
    bar1.key_up(evt.keyCode);
    bar2.key_up(evt.keyCode);
}

function draw_points(){
    ctx.font = "bold "+TEXT_HEIGHT+"px 'courier'";
    ctx.textAlign = 'left';

    ctx.fillStyle = bar1.fillStyle;
    ctx.strokeStyle = bar1.strokeStyle;
    ctx.fillText(points_1, 20,30);

    ctx.fillStyle = bar2.fillStyle;
    ctx.strokeStyle = bar2.strokeStyle;
    ctx.fillText(points_2, 20,H-TEXT_HEIGHT);
}

function draw(){
    ctx.clearRect(0,0,W,H);

    draw_points();

    bar1.draw();
    bar2.draw();
    ball.draw();



    ctx.fill();
    ctx.stroke();
}

function step(){
    bar1.step();
    bar2.step();
    ball.step();
    draw();
}


function init(){
    var canvas = document.getElementById("canvas");
    canvas.width = W; 
    canvas.height = H;
    if (canvas.getContext) ctx = canvas.getContext("2d");
    timer = setInterval(step,33);

    document.onkeydown = key_down;
    document.onkeyup = key_up;w

}
