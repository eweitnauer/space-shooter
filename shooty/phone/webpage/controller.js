var comm;

function init() {
  var params = getUrlParameters();
  console.log('code: ', params.session_code);
  console.log('name: ', params.player_name);
//  comm = new Communicator(io);
//  comm.connect();
//  comm.on('connect', function() {
//    comm.join_session(params.session_code, {player_name: params.player_name}, function(code) {
//      document.getElementById('conn_status').innerHTML = 'Connected!';
//    });
//  });
  setupListeners();
}

function setupListeners() {
  var label1 = document.getElementById('label1');
  var label2 = document.getElementById('label2');
  var label3 = document.getElementById('label3');
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
      label1.innerHTML = event.alpha + ", " + event.beta + ', ' + event.gamma;
    }, false);
  } else label1.innerHTML = 'NO deviceorientation events';
  if (window.OrientationEvent) {
    window.addEventListener('MozOrientation', function(event) {
      label2.innerHTML = event.x + ", " + event.y + ", " + event.z;
    }, false);
  } else label2.innerHTML = 'NO MozOrientation events'
  var touchListener = function(event) {
    for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      console.log(touch);
      label3.innerHTML = touch.pageX + ", " + touch.pageY;
    }
  }
  document.getElementById('bg').addEventListener('touchmove', touchListener, false);
  document.getElementById('bg').addEventListener('touchstart', touchListener, false);
}
 
function getUrlParameters() {
  var map = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    map[key] = value;
  });
  return map; 
}
