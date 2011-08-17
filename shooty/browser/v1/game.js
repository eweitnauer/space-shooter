var Game = {
    w: 1237, h: 777
   ,borders: {left:325, top:131, right: 1167, bottom: 361}
   ,grav_x:0, grav_y:0.02
   ,air_friction: 0.01
   ,step_timer: null
   ,ships: {}
   ,shots: new LinkedList
   ,lines: []//{A:new Point(261,235), B:new Point(1135,101)},
            //{A:new Point(1135,101), B:new Point(1212,668)},
            //{A:new Point(1212,668), B:new Point(344,782)},
            //{A:new Point(344,782), B:new Point(261,235)}]
   ,start: function() {
      Animation.time = Date.now();
      this.canvas = document.getElementById("canvas");
      this.canvas.width = this.w; 
      this.canvas.height = this.h;
      this.painter = new PaintEngine(this.canvas);
      this.step_timer = setInterval(this.step, 30);
      Game.main_sprite = new Sprite([], 'background');
      Game.main_sprite.center_img = false;
      var anim = new Sprite([2000,200,200,200,200,200,200,200,10000], 'solar');
      anim.scale = 0.8;
      Game.main_sprite.child_sprites.push(anim);
      anim.x = 765; anim.y = 650;
      Game.painter.add(Game.main_sprite);
      Game.painter.add(new ScoreBoard());
      Game.infobar = new Infobar();
      Game.painter.add(Game.infobar);
      Game.lines = load_collision_data_from_svg(Game.coll_data);
   }
  ,forEachActiveShip: function(fn) {
    for (s in Game.ships) {
      if (Game.ships.hasOwnProperty(s) && !Game.ships[s].destroyed) fn(Game.ships[s]);
    }
  }
  /// move the shots and remove marked ones (which hit something / flew too far)
  ,handleShots: function() {
    Game.shots.forEach(function(shot, el) {
      shot.step();
      if (!shot.display) el.remove();
    });
  }   
 ,collisionDetection: function() {
      // shot - ship collisions
      Game.forEachActiveShip(function(ship) {
        Game.shots.forEach(function(shot) {
          Physics.checkCollision(Game.ships[s], shot,
            function(ship, shot, px, py) {
              if (shot.shooter == ship) return; // don't hit own ship
              new Explosion(shot.x, shot.y);
              Physics.letCollide(ship, shot);
              ship.hit(shot.energy);
              if (ship.destroyed) shot.shooter.points++;
              shot.kill();
              sendVibrate(ship.code);
          });
        });
      });
      
      // ship - world collisions
      Game.forEachActiveShip(function(ship) {
        for (var i=0; i<Game.lines.length; ++i) {
          Physics.checkCollision2(Game.ships[s], Game.lines[i], function(ship, line, p) {
            line.mass = 100; line.vx = 0; line.vy = 0; line.x = p.x, line.y = p.y;
            line.restitution = 0.2;
            var energy = Physics.letCollide(ship, line);
            //if (!ship.attemptLand(line))
            ship.hit(energy);
            if (!ship.destroyed && energy>5) sendVibrate(ship.code);
          });
        }
      });
      
      // shot - world collisions
      Game.shots.forEach(function(shot) {
        for (var i=0; i<Game.lines.length; ++i) {
          Physics.checkCollision2(shot, Game.lines[i], function(shot, line, p) {
            shot.kill();
          });
        }
      });
        
      // ship - ship collisions
      Game.forEachActiveShip(function(ship1) {
        Game.forEachActiveShip(function(ship2) {
          if (ship1.code>ship2.code) Physics.checkCollision(ship1, ship2,
            function(ship1, ship2, px, py) {
              var energy = Math.max(Physics.letCollide(ship1, ship2), 10);
              var pts1=ship1.points, pts2=ship2.points;
              ship1.hit(energy);
              ship2.hit(energy);
              if (ship1.destroyed && !(ship2.destroyed && pts2==0)) ship2.points++;
              if (ship2.destroyed && !(ship1.destroyed && pts1==0)) ship1.points++;
              new Explosion(px, py);
              sendVibrate(ship1.code);
              sendVibrate(ship2.code);
          });
        });
      });
    }
   ,stepShips: function(){
     Game.forEachActiveShip(function(ship) { ship.step() });
    }

  ,step: function() {
    Animation.time = Date.now();
    // move the ships
    Game.stepShips();
    // handle the shots
    Game.handleShots();
    // collision dectection
    Game.collisionDetection();
    // update the display
    Game.painter.draw();
  }
   ,shipcolors: ['rgba(255,0,0,0.7)','rgba(0,255,0,0.7)','rgba(0,0,255,0.7)','rgba(0,0,0,0.7)']
   ,nextshipcolor : 0
};

Infobar = function() {
  jQuery.extend(this, new Sprite([], ''));
  this.extra_draw = function(ctx) {
    ctx.font = "bold italic 14 px sans";
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = '#555';
    ctx.save();
    ctx.translate(1144,95);
    ctx.rotate(-0.01);
    ctx.fillText('join game with session code ' + next_session_code, 0, 0);
    ctx.restore();
  }
}

ScoreBoard = function() {
  jQuery.extend(this, new Sprite([], ''));
  this.extra_draw = function(ctx) {
    ctx.font = "bold italic 14 px sans";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = '#555';
    ctx.save();
    ctx.translate(340,690);
    ctx.rotate(-0.005);
    var i = 0;
    for (s in Game.ships) {
      var ship = Game.ships[s];
      ctx.save();
      ctx.translate(Math.floor(i/2)*200, (i%2)*28);
      ship.score_sprite.draw(ctx);
      ctx.restore();
      i++;
    }
    ctx.restore();
  }
}

Game.coll_data = 
'<?xml version="1.0" encoding="UTF-8" standalone="no"?>\
<svg\
   xmlns:dc="http://purl.org/dc/elements/1.1/"\
   xmlns:cc="http://creativecommons.org/ns#"\
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
   xmlns:svg="http://www.w3.org/2000/svg"\
   xmlns="http://www.w3.org/2000/svg"\
   id="svg2"\
   version="1.1"\
   width="1237"\
   height="777">\
  <path\
     style="color:#000000;fill:none;stroke:#000000;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none;stroke-dashoffset:0;marker:none;visibility:visible;display:inline;overflow:visible;enable-background:accumulate"\
     d="m 303.6924,108.62241 12.44709,455.54054 39.80682,26.09213 23.5946,-20.00929 22.26026,13.3434 -3.33005,26.39671 52.44535,1.82746 8.40923,-36.29112 -21.9876,-45.87227 26.52693,0.40456 -7.61992,-43.99105 135.86475,23.84406 -34.46656,45.45455 8.83273,5.903 -26.23716,63.73211 20.99554,-14.5907 20.11951,30.31269 47.37486,4.06104 4.84133,-8.00894 14.95621,10.50648 44.91211,-6.78482 -25.79335,-15.70461 -0.80642,-16.38337 -59.85962,-11.38249 70.7664,-44.70616 12.76615,-32.86826 18.61692,4.26407 24.3575,34.67833 57.52453,-8.06695 6.29171,64.00477 -21.47126,18.36167 -49.02247,-6.18438 -7.56802,22.03111 48.30888,11.84081 41.63428,-26.3532 31.8066,13.58994 4.93415,14.03088 20.14561,7.33016 33.70948,-1.49388 46.49303,-49.68384 17.20716,0.25526 3.79707,-22.50681 16.02657,2.02181 -13.63927,-28.53745 -44.29136,-20.91142 117.8599,-0.45543 11.7045,-32.04444 -8.2034,-41.26011 -43.7982,-40.00406 142.7279,-0.19145 6.7356,-15.43193 5.4074,-42.36863 43.7001,0.56092 -0.8828,-287.31867 -896.9313,19.01728 0,-1e-5 z"\
     id="path2818" collision-object="true"/>\
</svg>'
