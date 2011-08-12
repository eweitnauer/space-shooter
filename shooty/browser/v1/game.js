var Game = {
    w: 1280, h: 800
   ,borders: {left:344, top:261, right: 1135, bottom: 668}
   ,grav_x:0, grav_y:0.02
   ,air_friction: 0.01
   ,step_timer: null
   ,ships: {}
   ,deadShips: {}
   ,shots: new LinkedList
   ,lines: [{A:new Point(261,235), B:new Point(1135,101)},
            {A:new Point(1135,101), B:new Point(1212,668)},
            {A:new Point(1212,668), B:new Point(344,782)},
            {A:new Point(344,782), B:new Point(261,235)}]
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
      anim.x = 990; anim.y = 565;
      Game.painter.add(Game.main_sprite);
      Game.infobar = new Infobar();
      Game.painter.add(Game.infobar);
   }
  /// move the shots and remove marked ones (which hit something / flew too far)
  ,handleShots: function() {
    Game.shots.forEach(function(shot, el) {
      shot.step();
      if (!shot.display) el.remove();
    });
  }
 ,handleShips : function(){
    // kill dead ships 
    for (var s in Game.ships) {
      var ship = Game.ships[s];
      if (ship.energy <= 0) {
        ship.explode();
        delete Game.ships[ship.session_code]; 
        ship.deathTime = Animation.time;
        Game.deadShips[ship.session_code]=ship;
        ship.display = false;
      }
    }
    for(var s in Game.deadShips){
      var ship = Game.deadShips[s];
      if((Animation.time - ship.deathTime) > 3000) {
        delete Game.deadShips[ship.session_code];
        Game.ships[ship.session_code] = ship;
        ship.spawn();
        ship.display = true;
      }
    }
  }
   
 ,collisionDetection: function() {
      // shot - ship collisions
      for (var s in Game.ships) Game.shots.forEach(function(shot) {
        Physics.checkCollision(Game.ships[s], shot,
          function(ship, shot, px, py) {
            //Game.explosions.push(new Explosion(shot.x, shot.y));
            new Explosion(shot.x, shot.y);
            shot.erase = true;
            shot.animation.finished = true;
            ship.energy -= shot.energy;
            Physics.letCollide(ship, shot);
            sendVibrate(ship.code);
        });
      });
      
      // ship - world collisions
      for(var s in Game.ships) {
        for (var i=0; i<Game.lines.length; ++i) {
          Physics.checkCollision2(Game.ships[s], Game.lines[i], function(ship, line, p) {
            line.mass = 100; line.vx = 0; line.vy = 0; line.x = p.x, line.y = p.y;
            line.restitution = 0.2;
            var energy = Physics.letCollide(ship, line);
            //if (!ship.attemptLand(line))
            ship.energy -= energy;
            if (energy>5) sendVibrate(ship.code);
          });
        }
      }
        
      // ship - ship collisions
      for (var s1 in Game.ships) for (var s2 in Game.ships) {
        if (s1>s2) Physics.checkCollision(Game.ships[s1], Game.ships[s2],
          function(ship1, ship2, px, py) {
            var energy = Math.max(Physics.letCollide(ship1, ship2), 10);
            ship1.energy -= energy;
            ship2.energy -= energy;
            //Game.explosions.push(new Explosion(px, py));
            new Explosion(px, py);
            sendVibrate(ship1.code);
            sendVibrate(ship2.code);
        });
      }
    }
   ,stepShips: function(){
        for (var s in Game.ships){
            var ship = Game.ships[s];
            ship.step(); 
            if(ship.steer_data && ship.steer_data.accel && Math.random()< 0.67){
                var rot = (ship.rot + Math.PI/2);
                var r = 20;
                new Smoke(ship.x+Math.cos(rot)*r+(Math.random()-0.5)*6,ship.y+Math.sin(rot)*r+(Math.random()-0.5)*6);
            }
        }
    }

  ,step: function() {
    Animation.time = Date.now();
    // kill dead vessels
    Game.handleShips();
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
    ctx.textAlign = "left";
    ctx.fillStyle = '#555';
    ctx.save();
    ctx.translate(842, 151);
    ctx.rotate(-0.14);
    ctx.fillText('join game with session code ' + next_session_code, 0, 0);
    ctx.restore();
  }
}
