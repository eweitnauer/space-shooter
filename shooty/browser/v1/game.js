var Game = {
    w: 1237, h: 777
   ,borders: {left:336, top:158, right: 1171, bottom: 355}
   ,grav_x:0, grav_y:0.02
   ,air_friction: 0.01
   ,wind_vx: 0.05
   ,wind_vy: -0.01
   ,step_timer: null
   ,ships: {}
   ,shots: new LinkedList
   ,aliens: new LinkedList
   ,smokes: new LinkedList
   ,lines: []
   ,start: function() {
      Animation.time = Date.now();
      this.canvas = document.getElementById("canvas");
      this.canvas.width = this.w; 
      this.canvas.height = this.h;
      this.painter = new PaintEngine(this.canvas);
      this.step_timer = setInterval(this.step, 30);
      Game.main_sprite = new Sprite([], 'background');
      Game.main_sprite.center_img = false;
      Game.painter.add(Game.main_sprite);
      Game.painter.add(new ScoreBoard());
      Game.infobar = new Infobar();
      Game.painter.add(Game.infobar);
      Game.lines = load_collision_data_from_svg(Game.coll_data);
      for (l in Game.lines) {Game.lines[l].type = 'landscape'}
      this.spawn_aliens();
   }
  ,forEachActiveShip: function(fn) {
    for (var s in Game.ships) {
      if (Game.ships.hasOwnProperty(s) && !Game.ships[s].destroyed) fn(Game.ships[s]);
    }
  }
  /// iterates over all aliens, ships and landscape lines
  ,forEachPhysicalObject: function(fn) {
    Game.aliens.forEach(fn);
    Game.lines.forEach(fn);
    Game.forEachActiveShip(fn);
  }
  ,spawn_missiles: function(num) {
    for (var i=0; i<num; i++) {
      var x = Game.borders.left + 20 + Math.random()*(Game.borders.right-Game.borders.left-40);
      var y = Game.borders.top + 20 + Math.random()*(Game.borders.bottom-Game.borders.top-40);
      new Mine(x,y,0,1);
    }
  }
  ,spawn_aliens: function(){
    new Ufo();
    new Pyramid();
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
          Physics.checkCollision(ship, shot,
            function(ship, shot, px, py) {
              if (shot.shooter == ship) return; // don't hit own ship

                for(var i=0;i<5;++i){
                    var s = new Smoke(shot.x, shot.y);
                    s.rot = Math.random()*1.5-0.75;
                    s.alpha = 0.8+Math.random()*0.2;
                    s.scale = 0.3+Math.random()*0.7;
                    s.alpha_decay = 0.05+Math.random()*0.1;
                }

              new Explosion(shot.x, shot.y, 'S');
              // only move ship if it is not landed
              Physics.letCollide(ship, shot, ship.state == 'flying', false);
              ship.hit(shot.energy);
              if (ship.destroyed) shot.shooter.points++;
              shot.kill();
          });
        });
      });
      
      // ship - world collisions
      Game.forEachActiveShip(function(ship) {
        if (ship.state != 'flying') return;
        for (var i=0; i<Game.lines.length; ++i) {
          Physics.checkCollision2(ship, Game.lines[i], function(ship, line, p) {
            line.mass = 100; line.vx = 0; line.vy = 0; line.x = p.x, line.y = p.y;
            line.restitution = 0.4;
            var energy = Physics.letCollide(ship, line, true, false);
            if (!ship.attempt_land(line)) {
              ship.hit(Math.max(10,energy));
              new Explosion(p.x, p.y, 'S');
            }
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

      // alien - ship collision
     Game.aliens.forEach(function(alien) {
         Game.forEachActiveShip(function(ship){
             Physics.checkCollision(alien, ship,function(alien, ship, px, py) {
                var energy = Math.max(Physics.letCollide(alien, ship, 
                                                         true, ship.state == 'flying' 
                                                         ), 10);
                var pts=ship.points;
                ship.hit(energy);
                alien.hit(energy);
                if (alien.destroyed) ship.points++;
                new Explosion(px, py, 'S');
             });  
         });
     });

     // alien - shot  collisions
      Game.aliens.forEach(function(alien) {
        Game.shots.forEach(function(shot) {
          Physics.checkCollision(alien, shot,
            function(alien, shot, px, py) {
              if (shot.shooter.type == 'alien') return; // aliens dont shoot each other

              var s = new Smoke(shot.x, shot.y);
              s.rot = Math.random()*1.5-0.75;
              s.alpha = 0.8+Math.random()*0.2;
              s.scale = 0.3+Math.random()*0.7;
              s.alpha_decay = 0.05+Math.random()*0.1;
              new Explosion(shot.x, shot.y, 'S');

              // only move ship if it is not landed
              Physics.letCollide(alien, shot, true, false);
              alien.hit(shot.energy);
              if (alien.destroyed) shot.shooter.points++;
              shot.kill();

          });
        });
      });
      
      // alien - world collisions
      Game.aliens.forEach(function(alien) {
        for (var i=0; i<Game.lines.length; ++i) {
          Physics.checkCollision2(alien, Game.lines[i], function(alien, line, p) {
            line.mass = 100; line.vx = 0; line.vy = 0; line.x = p.x, line.y = p.y;
            line.restitution = 0.4;
            var energy = Physics.letCollide(alien, line, true, false);
            alien.hit(Math.max(1,energy), 'landscape');
            if (!(alien instanceof Mine)) new Explosion(p.x, p.y, 'S');
          });
        }
      });

      // alien - alien collisions
      Game.aliens.forEach(function(alien1, el) {
        el.forTail(function(alien2) {
          Physics.checkCollision(alien1, alien2,
            function(alien1, alien2, px, py) {
              var energy = Math.max(Physics.letCollide(alien1, alien2), 3);
              alien1.hit(energy, alien2.type);
              alien2.hit(energy, alien1.type);
              new Explosion(px, py, 'S');
          });
        });
      });
        
      // ship - ship collisions
      Game.forEachActiveShip(function(ship1) {
        Game.forEachActiveShip(function(ship2) {
          if (ship1.code>ship2.code) Physics.checkCollision(ship1, ship2,
            function(ship1, ship2, px, py) {
              // only flying ships can be moved in a collision
              var energy = Math.max(Physics.letCollide(ship1, ship2, ship1.state=='flying', ship2.state=='flying'), 10);
              var pts1=ship1.points, pts2=ship2.points;
              ship1.hit(energy);
              ship2.hit(energy);
              if (ship1.destroyed && !(ship2.destroyed && pts2==0)) ship2.points++;
              if (ship2.destroyed && !(ship1.destroyed && pts1==0)) ship1.points++;
              new Explosion(px, py, 'S');
          });
        });
      });
    }
   ,stepShips: function(){
       Game.forEachActiveShip(function(ship) { ship.step(); });
    }
    ,stepAliens: function(){
        Game.aliens.forEach(function(alien,el) { 
            alien.step(); 
            if(alien.destroyed) {
                el.remove();
                if( alien instanceof Ufo ){
                    setTimeout(function(){
                        Game.spawn_aliens();
                    },4000);
                }

            }
        });
    }
    ,stepSmokes: function(){
        Game.smokes.forEach(function(smoke,el){
            smoke.step();
            if(smoke.animation.finished) el.remove();
        });
    }

  ,step: function() {
    Animation.time = Date.now();
    // move the ships
    Game.stepShips();
    
    // here ??
    Game.stepAliens();

    // handle the shots
    Game.handleShots();

    // collision dectection
    Game.collisionDetection();

    // wind effect
    Game.stepSmokes();
    
    // update the display
    Game.painter.draw();


  }
   ,shipcolors: ['rgba(255,0,0,0.7)','rgba(0,255,0,0.7)','rgba(0,0,255,0.7)','rgba(0,0,0,0.7)']
   ,nextshipcolor : 0
};

Infobar = function() {
  jQuery.extend(this, new Sprite([], ''));
  this.extra_draw = function(ctx) {
    ctx.font = '20px "Permanent Marker"';
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = '#00a5cd';
    ctx.save();
    ctx.translate(1080,112);
    ctx.rotate(0.02);
    ctx.fillText('join game with session code ' + comm.session_code, 0, 0);
    ctx.restore();
  }
}

ScoreBoard = function() {
  jQuery.extend(this, new Sprite([], ''));
  this.extra_draw = function(ctx) {
    ctx.font = '15px "Permanent Marker"';
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = '#555';
    ctx.save();
    ctx.translate(330,713);
    ctx.rotate(0.005);
    var i = 0;
    for (s in Game.ships) {
      var ship = Game.ships[s];
      ctx.save();
      //ctx.translate(Math.floor(i/2)*200, (i%2)*28);
      ctx.translate(i*175, 8);
      ship.score_sprite.draw(ctx);
      ctx.restore();
      i++;
    }
    ctx.restore();
  }
}

Game.coll_data = '\
<?xml version="1.0" encoding="UTF-8" standalone="no"?>\
<svg\
   xmlns:dc="http://purl.org/dc/elements/1.1/"\
   xmlns:cc="http://creativecommons.org/ns#"\
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
   xmlns:svg="http://www.w3.org/2000/svg"\
   xmlns="http://www.w3.org/2000/svg"\
   version="1.1"\
   width="1280"\
   height="800"\
   id="svg2">\
  <metadata\
     id="metadata8">\
    <rdf:RDF>\
      <cc:Work\
         rdf:about="">\
        <dc:format>image/svg+xml</dc:format>\
        <dc:type\
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />\
        <dc:title></dc:title>\
      </cc:Work>\
    </rdf:RDF>\
  </metadata>\
  <defs\
     id="defs6" />\
  <path\
     d="m 323.61111,525 21.52778,20.13889 14.58333,8.33333 2.08334,20.13889 35.41666,14.58333 11.80556,17.36112 25,10.41666 25,-18.75 -20.83334,-10.41666 -29.86111,-6.25 0,-9.72223 79.16667,-9.72222 15.27778,7.63889 18.75,58.33333 -10.41667,4.86111 -27.08333,-20.83333 -16.66667,28.47222 45.13889,40.97223 48.61111,-2.77778 31.25,-22.91667 L 643.75,657.63889 669.44445,555.55556 632.63889,531.25 686.80556,529.86111 681.25,495.83333 639.58333,475 l 218.05556,-9.72222 -33.33333,76.38889 5.55555,21.52777 8.33334,4.16667 -7.63889,36.11111 11.80555,6.25 -12.5,30.55556 4.16667,4.86111 35.41667,7.63889 10.41666,20.83333 19.44445,-8.33333 0,-20.13889 6.25,-0.69445 4.86111,14.58334 34.72222,0 9.02778,-11.11111 L 944.44445,612.5 923.61111,595.13889 1034.7222,593.05556 1011.8056,500 l -31.25004,-29.86111 -3.47223,-22.22222 58.33337,-1.38889 47.2222,-15.27778 -0.6945,-34.72222 -38.8888,-33.33334 117.3611,2.08334 1.3889,33.33333 9.7222,1.38889 6.25,-172.22222 -8.3334,-77.08334 -31.25,-0.69444 -30.5555,-7.63889 -777.77779,-15.27778 z"\
     id="path2987" collision-object="true"\
     style="fill:none;stroke:#ff0000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />\
</svg>';

/**
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
</svg>'*/
