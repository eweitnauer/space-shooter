var Game = {
  //w: 1237, h: 777
  w: 1024, h: 768
  ,borders: {left:150, top:145, right: 970, bottom: 325}
  ,grav_x:0, grav_y:0.02
  ,air_friction: 0.01
  ,wind_vx: 0.05
  ,wind_vy: -0.01
  ,step_timer: null
  ,ships: {}
  ,coins: 0
  ,points: 0
  ,lives: 3
  ,shots: new LinkedList
  ,aliens: new LinkedList
  ,smokes: new LinkedList
  ,pointObjects : new LinkedList
  ,spawn_next_wave_request_time: null
  ,lines: []
  ,level: 0 
  ,currentStep: 0
  ,state: 'paused' //'over'
//  ,splashScreen: null
  ,startTime: Date.now()
  ,start: function() {
    Animation.time = Date.now();
    this.canvas = document.getElementById("canvas");
    this.canvas.width = this.w; 
    this.canvas.height = this.h;
    
    this.painter = new PaintEngine(this.canvas);
    this.step_timer = setInterval(this.step, 1000/30);
    Game.main_sprite = new Sprite([], 'bg');
    Game.main_sprite.center_img = false;
    Game.painter.add(Game.main_sprite);
    Game.painter.draw();
    Game.painter.add(new ScoreBoard());
    Game.infobar = new Infobar();
    Game.painter.add(Game.infobar);
    Game.overlay = new Overlay();
    Game.painter.add(Game.overlay);
//    Game.lines = load_collision_data_from_svg(Game.coll_data);
//    for (l in Game.lines) {Game.lines[l].type = 'landscape'}
    Game.lines = JSON.parse(preloaded_collision_lines);
    for (var l=0; l<Game.lines.length; l++) {
      Game.lines[l].A = new Point(Game.lines[l].A.x, Game.lines[l].A.y)
      Game.lines[l].B = new Point(Game.lines[l].B.x, Game.lines[l].B.y)
      Game.lines[l].type = 'landscape'
    }
    //this.spawn_aliens();
    this.state = 'running';
  }
/*  ,enterShop: function(ship) {
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
*/
/*  // can also be used to switch to next splash screen
  ,enterSplashScreen: function(splashScreen){
    if(Game.splashScreen){
      Game.splashScreen.display = false;
      Game.splashScreen.animation.finished = true;
      Game.main_sprite.child_sprites.remove(Game.splashScreen);
    }
    Game.splashScreen = splashScreen;
    Game.main_sprite.child_sprites.push(splashScreen);
    Game.state = 'splash';
  }
  ,leaveSplashScreen: function(){
    if(Game.splashScreen){
      Game.splashScreen.display = false;
      Game.splashScreen.animation.finished = true;
      Game.splashScreen = null;
    }
    Game.state = 'running';
  }
*/  
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
  ,spawn_next_wave: function(){
    var num = ((Game.level-1) % 4)+1;
    var skillLevel = Math.floor((Game.level-1)/4)+1;
    for(var i=0;i<num;++i){
      var f = new Fighter();
      f.coins = skillLevel * 100;
      f.max_energy = skillLevel * 50;
      f.shot_energy = 1*skillLevel;
      if(Game.level > 6){
        f.shot_time = 1000;
      }else if(Game.level > 10){
        f.shot_time = 500;      
      }else{
        f.shot_time = 1500;
      }
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
          //if (!(alien instanceof Mine)) new Explosion(p.x, p.y, 'sploing');
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
    Game.currentStep ++;
    var numLivesTotal = 0;
    for(var i in Game.ships){
      numLivesTotal += Game.ships[i].lives;
    }
    if(Game.currentStep > 10 && numLivesTotal == 0){
      Game.state = 'over';
      var s = new Sprite([],'');
      s.extra_draw = function(ctx){
        ctx.save();
        ctx.font = '50px "Permanent Marker"';
        ctx.fillStyle = 'black';
        ctx.fillText('Game Over',400,350);
        ctx.fillStyle = '#00a5cd';
        ctx.fillText('Game Over',400-2,350-2);

        ctx.font = '35px "Permanent Marker"';
        ctx.fillStyle = 'black';
        ctx.fillText('Level:' + Game.level+ '   Points: '+ Game.coins,380,400);
        ctx.fillStyle = '#00a5cd';
        ctx.fillText('Level:' + Game.level+ '   Points: '+ Game.coins,380-1,400-1);
        


        ctx.restore();
      }
      Game.main_sprite.child_sprites.push(s);
    }

    //var counts = Game.painter.count_children_recursive();
    
    //console.log('number of sprites: top-level:' + counts['top-level-sprites'] + ' all:' + counts['all-sprites']);
    
    Animation.time = Date.now();
    
    /// overlay ...
    if(Game.overlay){
      var dt = Animation.time - Game.startTime;
      if(dt > 3000){
      Game.overlay.set_alpha(1.0-((dt - 3000)/2000));
        if(dt > 5000){
          Game.overlay.display=false;
          Game.overlay.animation.finished = true;
          Game.overlay = null;
        }
      }
    }
    
    /// levels ..
   // console.log(Game.aliens.length);
    if(Game.aliens.length == 0){
      if(!Game.spawn_next_wave_request_time){
        Game.spawn_next_wave_request_time = Animation.time;
      }else{
        var dt = Animation.time - Game.spawn_next_wave_request_time;
        if(dt > 8000){
          Game.level ++;
          Game.spawn_next_wave();
          Game.spawn_next_wave_request_time = null;
        }
      }
    }    

    switch(Game.state){
    case 'running':
      var t_stepping = measure_duration(function() {
        // move the ships
        Game.stepShips();
        
        // alien AI and movement
        Game.stepAliens();
        
        // handle the shots
        Game.handleShots();

        // wind effect
        Game.stepSmokes();

        // point strings and coins
        Game.stepPointObjects();
      });

      var t_collisions = measure_duration(function() {
        // collision dectection
        Game.collisionDetection();
      });
      
      var t_drawing = measure_duration(function() {
        // update the display
        Game.painter.draw();
      });
      
      Game.painter.show_fps({stepping: t_stepping, collision: t_collisions, drawing: t_drawing});
      
      break;
    case 'paused':
      // update the display
      //Game.painter.draw();
      break;
    case 'over':
      Game.painter.draw();
      break;
 //   case 'shop':
 //     Game.painter.draw();
 //     Shop.draw();
 //     break;
//    case 'splash':
 //     Game.painter.draw();
    }
  }
  ,shipcolors: ['rgba(255,0,0,0.7)','rgba(0,255,0,0.7)','rgba(0,0,255,0.7)','rgba(0,0,0,0.7)']
  ,nextshipcolor : 0
};

Overlay = function(){
  jQuery.extend(this, new Sprite([], ''));
  this.accel = new Sprite([],'overlay-accel');
  this.fire = new Sprite([],'overlay-fire');
  this.rotate = new Sprite([],'overlay-rotate');
  this.child_sprites.push(this.accel);
  this.child_sprites.push(this.fire);
  this.child_sprites.push(this.rotate);
  this.accel.x = 70;
  this.accel.y = 370;

  this.fire.x = 955;
  this.fire.y = 370;
  
  this.rotate.x = 520;
  this.rotate.y = 200;
  
  this.set_alpha = function(alpha){
    this.accel.alpha = alpha;
    this.fire.alpha = alpha;
    this.rotate.alpha = alpha;
  }
}

Infobar = function() {
  jQuery.extend(this, new Sprite([], ''));

  this.coin_sprite = new Sprite(120,'coin');
  this.child_sprites.push(this.coin_sprite);
  this.coin_sprite.x = 860;
  this.coin_sprite.y = 725;
  this.coin_sprite.scale = 0.5;
  this.coin_sprite.extra_draw = function(ctx){
    ctx.save();  
    ctx.textAlign = "left";
    ctx.font = '30px "Permanent Marker"';
    ctx.fillStyle = 'rgb(100,100,100)';
    ctx.fillText(''+Game.coins,30,-22);
//    ctx.fillText('total: ' + Game.points, 30,-5)
    ctx.restore();
  }
    
  this.extra_draw = function(ctx) {
    ctx.font = '18px "Permanent Marker"';
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = '#00a5cd';
    ctx.save();
    ctx.translate(900,100);
    ctx.rotate(0.02);
    if (comm && comm.connected) {
      ctx.fillText('join game with session code ' + comm.session_code, 0, 0);
    } else {
      ctx.fillText('connecting to server...', 0, 0);
    }
    
    ctx.translate(-650,-3);
    ctx.fillText('Level:' + (Game.level<10?'0':'')+Math.max(0,Game.level),0,0);
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
    ctx.translate(150,705);
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
   xmlns:svg="http://www.w3.org/2000/svg"\
   xmlns="http://www.w3.org/2000/svg"\
   id="svg2"\
   version="1.1"\
   width="1024"\
   height="768">\
  <path\
     style="fill:none;stroke:#ff0000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\
     d="m 136.91666,507.18055 36.11111,28.47222 2.08334,20.13889 72.22222,42.36111 25,-18.75 -54.70609,-23.98191 94.45609,-10.1066 15.54069,67.15893 -30.29069,-19.18153 -16.66667,28.47222 45.13889,40.97223 48.61111,-2.77778 31.25,-22.91667 51.38889,2.77778 25.69445,-102.08333 -36.80557,-24.30556 54.16668,-1.38889 -5.55556,-34.02778 -41.66667,-20.83333 215.64858,-10.52455 -31.8973,72.4036 5.19114,102.25917 61.76562,29.65894 10.45023,-25.15504 6.6879,15.38567 54.76044,1.72612 -34.56719,-65.61502 98.27384,0.32365 -14.09099,-95.46254 -31.25004,-29.86111 -3.47223,-22.22222 58.33337,-1.38889 47.22219,-15.27778 -0.6945,-34.72222 -38.8888,-33.33334 115.36111,2.08334 18.3204,33.11757 -4.0834,-249.30556 -842.7926,-22.00646 z"\
     id="path2987"\
     collision-object="true"/>\
</svg>';
