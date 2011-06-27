var field = {w: 400, h: 300}
var ball = {x: 40, y: 40, dx: 2, dy: 2, r: 14}
var pad1 = {x: 150, y: 0, h: 15, w: 100, dir: 0, speed: 6, pts: 0}
var pad2 = {x: 150, y: field.h-15, h: 15, w: 100, dir: 0, speed: 6, pts: 0}

var Painter = {
	paper: null,
	init: function() {
		this.paper = Raphael("display", field.w, field.h);
		ball.svg = this.paper.circle(ball.x, ball.y, ball.r-4);
		ball.svg.attr({fill:"orange", stroke:"#ffa", "stroke-width":2});
		pad1.svg = this.paper.rect(pad1.x, pad1.y, pad1.w, pad1.h);
		pad1.svg.attr({fill: "#ffa", stroke: "none"});
		pad1.text = this.paper.text(field.w-30,30,pad1.pts);
		pad1.text.attr({font: "30px Verdana", fill: "yellow"});
		pad2.svg = this.paper.rect(pad2.x, pad2.y, pad1.w, pad1.h);
		pad2.svg.attr({fill: "#ffa", stroke: "none"});
		pad2.text = this.paper.text(field.w-30,field.h-30,pad2.pts);
		pad2.text.attr({font: "30px Verdana", fill: "yellow"});
	},
	paint: function() {
  	//ball.svg.stop();
		ball.svg.animate({'cx': ball.x}, 30); ball.svg.animate({'cy': ball.y}, 30);
		//ball.svg.attr({'cx': ball.x, 'cy': ball.y});
		//pad1.svg.attr('x', pad1.x); pad2.svg.attr('x', pad2.x);
		pad1.svg.stop(); pad1.svg.animate({'x': pad1.x},30);
		pad2.svg.stop(); pad2.svg.animate({'x': pad2.x},30);
	},
	points: function() {
		pad1.text.remove();
		pad1.text = this.paper.text(field.w-30,30,pad1.pts);
		pad1.text.attr({font: "25px Verdana", fill: "yellow"});
		pad2.text.remove();
		pad2.text = this.paper.text(field.w-30,field.h-30,pad2.pts);
		pad2.text.attr({font: "25px Verdana", fill: "yellow"});
	},
	text: function(msg) {
		this.paper.text(field.w/2,field.h/2,msg).attr({font: "30px Verdana", fill: "yellow"});
	}
}

var Engine = {
	stepTimer: null,
	onKeyDown: function(evt) {
		if (evt.keyCode == 39) pad2.dir = 1;
		else if (evt.keyCode == 37) pad2.dir = -1;
		else if (evt.keyCode == 65) pad1.dir = -1;
		else if (evt.keyCode == 68) pad1.dir = 1;
		
	},
	onKeyUp: function(evt) {
		if (evt.keyCode == 39 || evt.keyCode == 37) pad2.dir = 0;
		else if (evt.keyCode == 65 || evt.keyCode == 68) pad1.dir = 0;
	},
	init: function() {
		this.stepTimer = setInterval(this.step, 30);
	},
	step: function() {
		// move pad 1
		pad1.x += pad1.speed * pad1.dir;
		if (pad1.x+pad1.w > field.w) pad1.x = field.w - pad1.w;
		else if (pad1.x < 0) pad1.x = 0;
		// move pad 2
		pad2.x += pad2.speed * pad2.dir;
		if (pad2.x+pad2.w > field.w) pad2.x = field.w - pad2.w;
		else if (pad2.x < 0) pad2.x = 0;
		// move ball
		ball.x += ball.dx; ball.y += ball.dy;
		if (ball.x-ball.r < 0) ball.dx = -ball.dx;
		else if (ball.x+ball.r > field.w) ball.dx = -ball.dx;
		if (ball.y+ball.r > field.h-pad2.h) { // lower end
			if (ball.x > pad2.x && ball.x < pad2.x+pad2.w) {
				ball.dy = -ball.dy; // caught it!
				ball.svg.animate({"50%": {stroke: "red"}, "100%": {stroke:"#ffa"}}, 250);
				ball.y = field.h-pad2.h-ball.r;
				if (ball.x < pad2.x+pad2.w/4) ball.dx -= 1; // change speed horizontally
				else if (ball.x > pad2.x+3*pad2.w/4) ball.dx += 1;
				if (Math.random() < 0.2) ball.dy -= 1; // speed up vertically
			} else if (ball.y+ball.r > field.h) {
				// player 2 lose
				pad1.pts++;
				Painter.points();
				if (pad1.pts==5) { // game over
					Engine.stop();
					Painter.text('Player 1 wins!');
				} else { // next round
					ball.x = field.w/2; ball.y = field.h/2;
					ball.dx = Math.random()<0.5 ? 2 : -2; ball.dy = 2;
				}
			}
		} else if (ball.y-ball.r < pad1.h) { // upper end
			if (ball.x > pad1.x && ball.x < pad1.x+pad1.w) {
				ball.dy = -ball.dy; // caught it!
				ball.svg.animate({"50%": {stroke: "red"}, "100%": {stroke:"#ffa"}}, 250);
				ball.y = pad1.h+ball.r;
				if (ball.x < pad1.x+pad1.w/4) ball.dx -= 1; // change speed horizontally
				else if (ball.x > pad1.x+3*pad1.w/4) ball.dx += 1;
				if (Math.random() < 0.2) ball.dy += 1; // speed up vertically
			} else if (ball.y-ball.r < 0) {
				pad2.pts++;
				Painter.points();
				if (pad2.pts==5) { // game over
					Engine.stop();
					Painter.text('Player 2 wins!');
				} else { // next round
					ball.x = field.w/2; ball.y = field.h/2;
					ball.dx = Math.random()<0.5 ? 2 : -2; ball.dy = -2;
				}
			}
		}
		
		// paint the changes
		Painter.paint();
	},
	stop: function() {
		clearInterval(this.stepTimer);
	}
}

init = function() {
  document.onkeydown = Engine.onKeyDown;
  document.onkeyup = Engine.onKeyUp;
  Painter.init();
  Engine.init();
}
