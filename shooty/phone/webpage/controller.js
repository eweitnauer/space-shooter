var comm;

function init() {
  var params = getUrlParameters();
  console.log('code: ', params.session_code);
  console.log('name: ', params.player_name);
  comm = new Communicator(io);
  comm.connect();
  comm.on('connect', function() {
    comm.join_session(params.session_code, {player_name: params.player_name}, function(code) {
      console.log('Joined Successfully!');
    });
  });
}

function getUrlParameters() {
  var map = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    map[key] = value;
  });
  return map; 
}
