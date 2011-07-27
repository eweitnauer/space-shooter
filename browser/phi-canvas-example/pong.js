/** We plan to provide a communication framework for data exchange between
smart-phone apps and browser applications and games. Therefore, I think its
a good idea to spend some time familiarizing with one of the most common
script languages for web-development: <em>Java-Scrip</em>.
Since we plan to open our gates inaugurate our website with a simple <em>Pong</em>
game as a <em>proof of concept</em>, we decided to dedicate a blog article to this
topic. Apparently, the internet seems to be full of javascript pong tutorials, but for
some strange reason the first page of google hits for the search terms
<em>javascript pong tutorial</em> provides only one result, that does actually lead
to a useful tutorial (<a href="http://www.i-programmer.info/projects/36-web/365-javascript-pong-.html">link</a>). Ok, if I optimize my search, I get some other useful hits (list here).
How can our tutorial now stand out against the others? Recently, several rendering
frameworks have become quite popular that are build on top of the html5-canvas. We will
discuss some differnt approaches for visualization.
<ul>
<li>pure canvas based drawing</li>
<li>drawing with Raphael.js</li>
<li>drawing with Paper.js</li>
</ul>
*/

/** The tutorial is split into two chapters. The first chapter presents the creation
of a simple pong game. The visualization is here implemented using the html-canvas
directly. In the 2nd chapter, we will replace the rendering function by a Raphael.js 
and a Paper.js renderer respectively in order to highlight the differences of the 
three approaches. Finally, some additional graphical effects will be added and it will
be discussed, how these can be implemented in the different rendering engines.


/** CHAPTER I */

/** For simplicity, we use simple global variables for constants and the game state.
The constants can later be defined in the style sheet or in a dedicated configuration 
file. In the first step of this tutorial, a simple loop will be set up, that draws 
the ball (a green circle) in the middle of the screen.

*/

var W= 500, H=300, BORDER=2, W_BAR=100, H_BAR=10, 
    V_BALL=6, R_BALL=10, COLOR_BALL="rgb(50,255,50)",
    COLOR_A="rgb(200,100,100)",COLOR_B="rgb(0,100,200)";

var ctx= null, timer=null, points_A=0, points_B=0,
    bar_A = { x: W/2, y: BORDER+H_BAR/2, vx: 0 },
    bar_B = { x: W/2, y: H-BORDER-H_BAR/2, vx: 0},
    ball = { x:0, y:0, vx:0, vy:0 };

Math.sign = function(x) { return (x < 0) ? -1 : (x > 0) ? 1 : 0; }
Math.clip = function(x, min, max) {
  return (x<min) ? min : (x>max) ? max : x;
}

/** Since the ball needs to be initialized after each round, its 
initialization is outsourced to a dedicated function. */
function init_ball_and_bars(){
    var angle = Math.PI/4;
    if (Math.random()<0.5) angle = -angle;
    if (Math.random()<0.5) angle += Math.PI;
    ball.x = W/2;
    ball.y = H/2;
    ball.vx = V_BALL * Math.cos(angle);
    ball.vy = V_BALL * Math.sin(angle);
}

/** The main initialization method first sets up the rendereing
context and then spaws a timer that steps the application's main
function 'loop' every 20 ms. */
function game_init(){
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
    ai_A();
    bar_A.x = Math.clip(bar_A.x + bar_A.vx, W_BAR/2, W-W_BAR/2);
    bar_B.x = Math.clip(bar_B.x + bar_B.vx, W_BAR/2, W-W_BAR/2);
    
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

function input_B(pitch) {
  bar_B.vx = - pitch / 10.0;
}

function ai_A() {
  var dx = ball.x - bar_A.x;
  bar_A.vx = Math.sign(dx) * Math.min(4,Math.abs(dx));
}
