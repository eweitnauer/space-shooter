Communicator = function(io) {
  this.io = io;
  this.url = 'http://phigames.com:9888';
  this.session_code = null; /// code of the most recently created session
  this.on_connect = function() {}
  this.on_disconnect = function() {}
  this.on_player_joined = function(session_code, data) {}
  this.on_player_left = function(session_code) {}
  this.on_data = function(session_code, data) {}
}

Communicator.prototype.connect = function() {
  this.socket = this.io.connect(this.url);
  var self = this;
  this.socket.on('connect', function() { self.on_connect() });
  this.socket.on('disconnect', function() { self.on_disconnect() });
  this.socket.on('player_joined', function() { self.on_player_joined.apply(arguments) });
  this.socket.on('player_left', function() { self.on_player_left.apply(arguments) });
  this.socket.on('data', function() {
    self.on_data.apply(arguments)
  });  
}

/// Creates a new session on the server and calls fn(session_code) after the
/// server replied.
Communicator.prototype.create_session = function(fn) {
  var self = this;
  this.socket.emit('create_session', function(code, success) {
    if (success) self.session_code = code;
    if (success && fn) fn(code);
  });
}

Communicator.prototype.send_data = function(code, data) {
  this.socket.emit('data', code, data);
}

Communicator.prototype.disconnect = function() {
  this.socket.disconnect();
}
