var Game = {
  w: 1237, h: 777
  ,borders: {left:336, top:158, right: 1171, bottom: 355}
  ,grav_x:0, grav_y:0.02
  ,air_friction: 0.01
  ,wind_vx: 0.05
  ,wind_vy: -0.01
  ,step_timer: null
  ,ships: {}
  ,coins: 100000
  ,points: 0
  ,lives: 3
  ,shots: new LinkedList
  ,aliens: new LinkedList
  ,smokes: new LinkedList
  ,pointObjects : new LinkedList
  ,lines: []
  ,level: 0 
  ,state: 'paused' //'paused','running','shop'
  ,start: function() {
    Animation.time = Date.now();
    this.canvas = document.getElementById("canvas");
    this.canvas.width = this.w; 
    this.canvas.height = this.h;
    
    this.painter = new PaintEngine(this.canvas);
    this.step_timer = setInterval(this.step, 30);
    Game.main_sprite = new Sprite([], 'bg');
    Game.main_sprite.center_img = false;
    Game.painter.add(Game.main_sprite);
    Game.painter.add(new ScoreBoard());
    Game.infobar = new Infobar();
    Game.painter.add(Game.infobar);
    Game.lines = load_collision_data_from_svg(Game.coll_data);
    for (l in Game.lines) {Game.lines[l].type = 'landscape'}
    this.spawn_aliens();
    this.state = 'running';
  }
  ,enterShop: function(ship) {
    if(Game.state != 'running') return;
    Shop.setup(this.painter.context, ship);
    Game.state = 'shop';
  }
  ,leaveShop: function() {
    Game.state = 'running';
  }
  ,triggerShop: function(ship) {
    Game.state == 'running' ? Game.enterShop(ship) : Game.leaveShop();
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
  /// iterates over all aliens, ships and landscape lines
  ,forEachMovableObject: function(fn) {
    Game.aliens.forEach(fn);
    Game.forEachActiveShip(fn);
    Game.smokes.forEach(fn);
  }
  ,spawn_missiles: function(num) {
    for (var i=0; i<num; i++) {
      var x = Game.borders.left + 20 + Math.random()*(Game.borders.right-Game.borders.left-40);
      var y = Game.borders.top + 20 + Math.random()*(Game.borders.bottom-Game.borders.top-40);
      new Missile(x,y,0,0);
    }
  }
  ,spawn_mines: function(num) {
    for (var i=0; i<num; i++) {
      var x = Game.borders.left + 20 + Math.random()*(Game.borders.right-Game.borders.left-40);
      var y = Game.borders.top + 20 + Math.random()*(Game.borders.bottom-Game.borders.top-40);
      new Mine(x,y,0,0);
    }
  }
  ,spawn_aliens: function(){
    //new Ufo();
//    new Ufo();
    //new Pyramid();
    new Fighter();
    new Fighter();
    new Fighter();
    new Fighter();
    //new YellowBox();
    //new Amoeba();
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
                                   var s = new Smoke(shot.x, shot.y, '2');
                                   s.rot = Math.random()*1.5-0.75;
                                   s.alpha = 0.8+Math.random()*0.2;
                                   s.scale = 0.3+Math.random()*0.7;
                                   s.alpha_decay = 0.05+Math.random()*0.1;
                                 }
                                 var energyAbsorbedByShield = ship.hit(shot.energy, shot.x, shot.y);
                                 var ex = new Explosion(shot.x, shot.y, energyAbsorbedByShield ? 'shield-sploing' : 'sploing');
                                 if(energyAbsorbedByShield){
                                   ex.scale = 0.7;
                                 }
                                 // only move ship if it is not landed
                                 Physics.letCollide(ship, shot, ship.state == 'flying', false);

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
            new Explosion(p.x, p.y, 'sploing');
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
          new Explosion(px, py, 'sploing');
        });  
      });
    });
    
    // alien - shot  collisions
    Game.aliens.forEach(function(alien) {
      Game.shots.forEach(function(shot) {
        if(!shot.shooter) return; // in this case, aliens cannot hit other aliens
        Physics.checkCollision(alien, shot,
                               function(alien, shot, px, py) {
                                 // aliens don't shoot each other
                                 // ships don't shoot their own rockets
                                 if (shot.shooter.type == 'alien' || alien.type == 'rocket') return; 
                                 
                                 var s = new Smoke(shot.x, shot.y, '2');
                                 s.rot = Math.random()*1.5-0.75;
                                 s.alpha = 0.8+Math.random()*0.2;
                                 s.scale = 0.3+Math.random()*0.7;
                                 s.alpha_decay = 0.05+Math.random()*0.1;
                                 new Explosion(shot.x, shot.y, 'sploing');
                                 
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
          if (!(alien instanceof Mine)) new Explosion(p.x, p.y, 'sploing');
        });
      }
    });
    
    // alien - alien collisions
    Game.aliens.forEach(function(alien1, el) {
      el.forTail(function(alien2) {
        Physics.checkCollision(alien1, alien2,
                               function(alien1, alien2, px, py) {
                                 if(alien1.is_yellow_box && alien1.is_yellow_box){
                                   return;
                                 }else if(alien1.type != 'rocket' && alien2.type != 'rocket'){
                                   var energy = Math.max(Physics.letCollide(alien1, alien2), 3);
                                   alien1.hit(energy, alien2.type);
                                   alien2.hit(energy, alien1.type);
                                 }else{
                                   var r = alien1.type == 'rocket' ? alien1 : alien2;
                                   var o = alien1.type != 'rocket' ? alien1 : alien2;
                                   r.energy = 0;
                                   r.destroy();

                                   if(o.type == 'rocket'){
                                     o.destroy();
                                   }else{
                                     o.hit(r.warhead_energy);
                                   }
                                 }
                                 new Explosion(px, py, 'sploing');
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
                                                            new Explosion(px, py, 'sploing');
                                                          });
      });
    });
  }
  ,stepPointObjects : function(){
    Game.pointObjects.forEach(function(o,el){
      if(o.animation.finished) el.remove();
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
  ,stepStory: function(){ 
    /*if (lifes == 0) {  
    // Display Game over Message
    //lifes = 3
    };
    
    if (level == 0) {
    // Display Greetings
    };
    if (level == 1) {
    // Display Level Description`
    // if start condition is not established, do that
    // if finished level++ 
    };
    if (level == 2) {
    // Display Level Description`
    // if start condition is not established, do that
    // if finished level++ 
    };
    if (level == 3) {
    // Display Level Description`
    // if start condition is not established, do that
    // if finished level++ 
    };  */
  }
  ,step: function() {
    Animation.time = Date.now();
    switch(Game.state){
    case 'running':
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

      // point strings and coins
      Game.stepPointObjects();
      
      // update the display
      Game.painter.draw();
      
      break;
    case 'paused':
      // update the display
      //Game.painter.draw();
      
      break;
    case 'shop':
      Game.painter.draw();
      Shop.draw();
     
    }
  }
  ,shipcolors: ['rgba(255,0,0,0.7)','rgba(0,255,0,0.7)','rgba(0,0,255,0.7)','rgba(0,0,0,0.7)']
  ,nextshipcolor : 0
};


Infobar = function() {
  jQuery.extend(this, new Sprite([], ''));

  this.coin_sprite = new Sprite(120,'coin');
  this.child_sprites.push(this.coin_sprite);
  this.coin_sprite.x = 1050;
  this.coin_sprite.y = 725;
  this.coin_sprite.scale = 0.5;
  this.coin_sprite.extra_draw = function(ctx){
    ctx.save();  
    ctx.textAlign = "left";
    ctx.font = '30px "Permanent Marker"';
    ctx.fillStyle = 'rgb(100,100,100)';
    ctx.fillText(''+Game.coins,30,-22);
    ctx.fillText('total: ' + Game.points, 30,5)
    ctx.restore();
  }
    
  this.extra_draw = function(ctx) {
    ctx.font = '20px "Permanent Marker"';
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = '#00a5cd';
    ctx.save();
    ctx.translate(1080,112);
    ctx.rotate(0.02);
    if(comm){
      ctx.fillText('join game with session code ' + comm.session_code, 0, 0);
    }
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

/// Returns a {x, y} object with a valid game position for alien spawning.
Game.getRandomPos = function(r) {
  return {x: Game.borders.left + 2*r + Math.random() * 
             (Game.borders.right-Game.borders.left-4*r)
         ,y: Game.borders.top + 2*r + Math.random() * 
             (Game.borders.bottom-Game.borders.top-4*r)};
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
