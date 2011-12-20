function test1() { // 43 fps
  var can = document.getElementById('canvas');
  var ctx = can.getContext('2d');
  var img = new Image();
  img.src = "./graphics/bg.png";
  var lastTime = Date.now();
  var counter = 0;
  var fps = 0;
  setInterval(function() {
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = 'green'
    var t = Date.now()
    if (t-lastTime > 1000) {
      fps = Math.round(counter*1000/(t-lastTime));
      counter = 0;
      lastTime = t
    } else { counter++ }
    ctx.font = "50px Arial";
    ctx.textAlign = 'right';
    ctx.fillText(fps, 60,50);
  }, 1000/100);
}

function test2() { //  fps
  var can = document.getElementById('canvas');
  var ctx = can.getContext('2d');
  var painter = new PaintEngine(this.canvas);
  var main_sprite = new Sprite([], 'bg');
  main_sprite.center_img = false;
  painter.add(main_sprite);
  var lastTime = Date.now();
  var counter = 0;
  var fps = 0;
  setInterval(function() {
    painter.draw(); // 41 fps
    //main_sprite.draw(ctx); // 30 fps
    //ctx.save();
    // ctx.translate(5, 5); // 42 fps
    // ctx.rotate(0.2); // 8 fps
    // ctx.scale(0.95, 0.95); // 30 fps
    //main_sprite.animation.drawCurrentImage(ctx, false); // 42 fps
    //ctx.restore();
    painter.show_fps();
  }, 1000/100);
}

function addship() {
  if ('key' in Game.ships) var code = ''+Math.random()*1000;
  else code = 'key';
  Game.ships[code] = new Ship(code); 
  Game.ships[code].spawn();
}

function test3() { // 40 fps
  Game.start();
}

function test4() { // 39 fps
  Game.start();
  addship();
  addship();
}

function test5() { // 37 fps // 35 fps mit flames // 32 fps mit flames und smoke
  Game.start();
  new Fighter();
  new Fighter();
  new Fighter();
  new Fighter();
}

function test6() { // 31 fps
  Game.start();
  addship();
  addship();
  new Fighter();
  new Fighter();
  new Fighter();
  new Fighter();  
}

function test7() {
  Game.start();
  touch_interface();
  acc_interface();
  addship();
  new Fighter();
  new Fighter();
  new Fighter();
}

function touch_interface() {
  var can = document.getElementById('canvas');
  var fn = function(event) {
    event.preventDefault();
    var steer_data = {accel:false, shot:false};
    for (var i=0; i<event.targetTouches.length; ++i) {
      var touch = event.targetTouches[i];
      if (touch.pageX < 512) steer_data.accel = true;
      else steer_data.shot = true;
    }
    if ('key' in Game.ships) {
      Game.ships['key'].steer(steer_data);
    }
  }
  can.addEventListener('touchmove', fn, false);
  can.addEventListener('touchstart', fn, false);
  can.addEventListener('touchend', fn, false);
}

function acc_interface() {
  document.addEventListener('acceleration',function(e) {
    var pitch = Math.atan2(e.accelY,-e.accelX) * 180/Math.PI;
    if ('key' in Game.ships) {
      Game.ships['key'].steer({pitch:1.5*pitch, mode:'relative'});
    }
  },false);
}

var comm;

function init() {
  enyo.setFullScreen(true)
  enyo.setAllowedOrientation('right')  
  test7();
  try{
    comm = new Communicator(io);
    registerListeners();
    comm.connect();
    comm.create_session();
  }catch(e){}
////  var t1 = Date.now()
////  timer = setInterval(function() {
////    var info = ImageBank.getLoadingInfo() // [loaded, N]
////    if (info[0] == info[1]) {
////      clearInterval(timer)
////      timer = null
////      console.log('It took', (Date.now()-t1)*0.001, 'seconds to load all images. Starting game...')
////      Game.start() 
////      keyboard_init()
////    }
////    console.log('Waiting for images to load...')
////  }, 100);
//  //timer = setInterval(function() { console.log(ImageBank.getLoadedImgRatio()) }, 1);
//  //setTimeout(function() { clearInterval(timer)}, 100)
//  Game.start()
//  keyboard_init();
}

function registerListeners() {
  comm.on('connect', function() {
    comm.connected = true;
    //document.body.removeChild(document.getElementById('connecting'));
  });
  comm.on('player_joined', function(code, data) {
    console.log("player joined")
    Game.ships[code] = new Ship(code);
    Game.ships[code].spawn();
    if ((typeof data === 'object') && data.player_name) {
      Game.ships[code].player_name = data.player_name;
    }
    comm.create_session();
  });
  comm.on('player_left', function(code) {
    if (!(code in Game.ships)) return;
    Game.ships[code].animation.finished = true;
    delete Game.ships[code];
  });
  comm.on('data', function(code, data) {
    if (!(code in Game.ships)) return;
    var steer_data = { pitch: data.pitch || 0, shot: data.btn2 && data.btn2.hold, 
                       accel: data.btn1 && data.btn1.hold, mode: data.mode };
    Game.ships[code].steer(steer_data);
  });
}

//var last_vibrate={};
function sendVibrate(session_code, duration) {
}
//  if (typeof(duration) != 'number') duration = 200;
//  var now = Date.now();
//  if (last_vibrate[session_code] && (now-last_vibrate[session_code]<200)) return;
//  if(comm){
//    comm.send_data(session_code, {vibrate: duration});
//  }
//  last_vibrate[session_code] = now;
//}
