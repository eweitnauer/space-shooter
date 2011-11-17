Communicator = function(io) {
  this.io = io;
  this.url = 'http://phigames.com:9888';
  this.session_code = null; /// code of the most recently created session
  this.listener_queue = [];
}

Communicator.prototype.connect = function() {
  this.socket = this.io.connect(this.url);
  for (var i=0; i<this.listener_queue.length; ++i) {
    this.socket.on(this.listener_queue[i][0], this.listener_queue[i][1]);
  }
  this.listener_queue = [];
  
}

Communicator.prototype.on = function(event_name, fn) {
  
  if (this.socket) this.socket.on(event_name, fn);
  else {
    this.listener_queue.push([event_name, fn]);
  }
  
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
