var comm, g_pitch, btn1_div, btn2_div;
var g_btn_state = {'1':{hold: false, triggered: false}
                  ,'2':{hold: false, triggered: false}};

function init() {
  var params = getUrlParameters();
  comm = new Communicator(io);
  comm.connect();
  comm.on('connect', function() {
    comm.join_session(params.session_code, {player_name: params.player_name}, function(code) {
      document.getElementById('conn_status').innerHTML = 'Connected!';
    });
  });
  setupListeners();
  // send with 15 Hz
  setInterval(sendData, 1000 / 15);
}

function sendData() {
  var data = { platform: 'webpage'
             , mode: 'relative'
             , pitch: g_pitch
             , btn1: g_btn_state[1]
             , btn2: g_btn_state[2]
             };
  comm.send_data(comm.session_code, data);
  g_btn_state[1].triggered = false;
  g_btn_state[2].triggered = false;
}

function setupListeners() {
  btn1_div = document.getElementById('btn1');
  btn2_div = document.getElementById('btn2');
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function(event) {
      g_pitch = Math.atan2(event.accelerationIncludingGravity.y,
                             -event.accelerationIncludingGravity.x) * 180/Math.PI;
    }, false);
  }
  var touchListener = function(event, btn) {
    var ts = event.targetTouches;
    var div = (btn==1) ? btn1_div : btn2_div;
    if (ts.length > 0) {
      div.className = "active";
      g_btn_state[btn].hold = true;
      g_btn_state[btn].triggered = true;
    } else {
      div.className = "";
      g_btn_state[btn].hold = false;
    }
    event.preventDefault();
  }
  btn1_div.addEventListener('touchmove', function(evt) {touchListener(evt, 1)}, false);
  btn1_div.addEventListener('touchstart', function(evt) {touchListener(evt, 1)}, false);
  btn1_div.addEventListener('touchcancel', function(evt) {touchListener(evt, 1)}, false);
  btn1_div.addEventListener('touchend', function(evt) {touchListener(evt, 1)}, false);
  btn2_div.addEventListener('touchmove', function(evt) {touchListener(evt, 2)}, false);
  btn2_div.addEventListener('touchstart', function(evt) {touchListener(evt, 2)}, false);
  btn2_div.addEventListener('touchcancel', function(evt) {touchListener(evt, 2)}, false);
  btn2_div.addEventListener('touchend', function(evt) {touchListener(evt, 2)}, false);
}
 
function getUrlParameters() {
  var map = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    map[key] = value;
  });
  return map; 
}
