/** Here, we present the java-script pong tutorial, which is split into
3 parts. In the first part, we implement the moving ball which is bounces
between the canvas borders. The 2nd part will also include the moving bars.
The 3rd parts completes the tutorial by adding a logic to handle the whole
match. */

/** For the canvas based java scrip pong, we first have to decide for a
program sturcture. In order to keep the code simple, we will not use
java script classes here. Instead, we use a set of global variables that 
describe the program state.
First we create a hash 'constants', that contains all constant values we
used. This part can possible later be exported to the style sheet. */
var W= 400, H=300, BORDER=2, W_BAR=100, H_BAR=10, 
    V_BALL=10, R_BALL=10, COLOR_BALL="rgb(50,255,50)",
    COLOR_A="rgb(200,100,100)",COLOR_B="rgb(0,100,200)";

var ctx= null, timer=null, points_A=0, points_B=0,
    bar_A = { x: 0, y: 0, vx: 0 }, bar_B = { x: 0, y: 0, vx: 0 },
    ball = { x:0, y:0, vx:0, vy:0 };

Math.sign = function(x) { 
    if(x < 0){  
        return -1; 
    }else if(x>0){ 
        return 1; 
    }else{ 
        return 0; 
    } 
}

/** Since the ball needs to be initialized after each round, its 
initialization is outsourced to a dedicated function. */
function init_ball_and_bars(){
    var angle = Math.random()*2*Math.PI;
    ball.x = W/2;
    ball.y = H/2;
    ball.vx = V_BALL * Math.cos(angle);
    ball.vy = V_BALL * Math.sin(angle);
    
    bar_A = { x: W/2, y: BORDER+H_BAR/2, vx: 0};
    bar_B = { x: W/2, y: H-BORDER-H_BAR/2, vx: 0};
}

/** The main initialization method first sets up the rendereing
context and then spaws a timer that steps the application's main
function 'loop' every 20 ms. */
function init(){
    // general initialization
    var canvas = document.getElementById("canvas");
    canvas.width = W; 
    canvas.height = H;
    ctx = canvas.getContext("2d");
 
    init_ball_and_bars();
   
    timer = setInterval(loop,20);
    timer = setInterval(function() { ball.vx *= 1.2 } ,2000);
}

/** This is the actual processing loop of our application. It first
applies one step of the game logic (moving the ball, moving the bars, 
checking collision and then renders the scene again. For simplicity, 
we split this into two functions: step() and  render() */
function loop(){ step(); render(); }


/** The step function fist checks for possible collision with the 
canvas borders. If a collision occurs during the movement, the balls
corresponding velocity component is inverted before. */
function step(){
    // the bars (this is outsourced to a funciton in order to
    // allow for easily replacing them by other implementations)
    move_A();
    move_B();
    
    var nextx = ball.x + ball.vx, nexty = ball.y+ball.vy;

    /// check for bar/ball collisions
    if(nexty < bar_A.y+H_BAR/2){
        if(nextx < bar_A.x-W_BAR/2 || nextx > bar_A.x+W_BAR/2){
            points_B++;
            init_ball_and_bars();
        }else{
            ball.vy *= -1;
        }
    }else if(nexty > bar_B.y-H_BAR/2){
        if(nextx < bar_B.x-W_BAR/2 || nextx > bar_B.x+W_BAR/2){
            points_A++;
            init_ball_and_bars();
        }else{
            ball.vy *= -1;
        }
    }else if(nexty < R_BALL || nexty > H-R_BALL) {
        // only if there is not collision with one of the bars
        ball.vy *= -1;
    }
    
    /// the x-direction needs to be checked in each case
    if(nextx < R_BALL || nextx > W-R_BALL) ball.vx *= -1;

    /// finally move the ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    
  
    
}

/** Once, a new state is produced, the current scene has to be rendered. Here, 
we use the canvas' rendering context directly. */
function render(){
    //    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = COLOR_BALL;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(ball.x,ball.y, R_BALL, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COLOR_A;
    ctx.fillRect(bar_A.x-W_BAR/2, bar_A.y-H_BAR/2, W_BAR, H_BAR);
    ctx.fillStyle = COLOR_B;
    ctx.fillRect(bar_B.x-W_BAR/2, bar_B.y-H_BAR/2, W_BAR, H_BAR);

    ctx.font = "bold 20 px 'courier'";
    ctx.fillStyle = '#444';
    ctx.fillText(points_A, 20,20);
    ctx.fillText(points_B, 20,H-20);
}



function move_A(){
    var dx = ball.x - bar_A.x;
    bar_A.x += Math.sign(dx) * Math.min(4,Math.abs(dx));
}

function move_B(){
    var dx = ball.x - bar_B.x;
    bar_B.x += Math.sign(dx) * Math.min(3,Math.abs(dx));
}




//var BAR_DIST_TO_BORDER = 10;
//var BAR_TO_BALL_FRICTION = 0.15;


/*

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
    document.onkeyup = key_up;

}
        */