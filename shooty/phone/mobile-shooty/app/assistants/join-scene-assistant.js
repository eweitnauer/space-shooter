function JoinSceneAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

JoinSceneAssistant.prototype.number_input = function(number) {
  Mojo.Log.info('pressed button ' + number);
  var val = this.controller.get("session_code").mojo.getValue();
  this.controller.get("session_code").mojo.setValue(val + number);
  Mojo.Controller.getAppController().playSoundNotification("vibrate", "");
}

JoinSceneAssistant.prototype.number_del = function() {
  Mojo.Log.info('pressed del button');
  var val = this.controller.get("session_code").mojo.getValue();
  this.controller.get("session_code").mojo.setValue(val.substr(0,val.length-1));  

//  this.controller.serviceRequest("palm://com.palm.vibrate", {
//    method: 'vibrate', parameters: { 'period': 0,'duration': 100 }
//  });
}

JoinSceneAssistant.prototype.join_tapped = function() {
  var mode = 'relative';
  var code = this.controller.get("session_code").mojo.getValue();
  Mojo.Log.info('joining session ' + code + '...');
  var self = this;
  this.socket.emit('join_session', code, function(code, success) {
    self.controller.get('btnJoin').mojo.deactivate();
    if (success) {
      Mojo.Controller.stageController.pushScene('controller', self.socket, code, mode);
    } else {
      // show error
      Mojo.Controller.errorDialog('Could not join session ' + code + '!'); 
    }
  });
}

JoinSceneAssistant.prototype.join_tappedAM = function() {
  var mode = 'absolute';
  var code = this.controller.get("session_code").mojo.getValue();
  Mojo.Log.info('joining session ' + code + '...');
  var self = this;
  this.socket.emit('join_session', code, function(code, success) {
    self.controller.get('btnJoin').mojo.deactivate();
    if (success) {
      Mojo.Controller.stageController.pushScene('controller', self.socket, code, mode);
    } else {
      // show error
      Mojo.Controller.errorDialog('Could not join session ' + code + '!'); 
    }
  });
}



JoinSceneAssistant.prototype.on_connect = function() {
  this.conn_spinner_model.spinning = false;
  this.controller.modelChanged(this.conn_spinner_model, this); 
  this.controller.get('input_div').show();
  this.controller.get('conn_status').innerHTML = 'Connected to Phi-Server!';
}

JoinSceneAssistant.prototype.connect = function() {
  Mojo.Log.info('connecting...');
  this.socket = io.connect('http://phigames.com:9888');
  this.socket.on('connect', this.on_connect.bind(this));
}

JoinSceneAssistant.prototype.setup = function() {
  // fix orientation
  if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("free");
	}
	// setup connection display
	this.controller.setupWidget("conn_spinner", {spinnerSize: "small"}, 
  	  this.conn_spinner_model = {spinning: true});
	// setup text field
	this.controller.setupWidget("session_code",
	    { textCase: Mojo.Widget.steModeLowerCase, hintText: '... enter join code' }, { });
	// setup number buttons
  for (var i=0; i<10; i++) {
    this.controller.setupWidget('btn'+i, {}, {label: ''+i});
    Mojo.Event.listen(this.controller.get('btn'+i),
                      Mojo.Event.tap,
                      this.number_input.bind(this, i));
  }
  this.controller.setupWidget('btnDel', {}, {label: 'Del'});
  Mojo.Event.listen(this.controller.get('btnDel'),
                    Mojo.Event.tap,
                    this.number_del.bindAsEventListener(this));
  this.controller.setupWidget('btnJoin', {type: Mojo.Widget.activityButton}, {label: 'Join Session'});
  this.controller.setupWidget('btnJoinAM', {type: Mojo.Widget.activityButton}, {label: 'Join Session (AM)'});
  Mojo.Event.listen(this.controller.get('btnJoin'),
                    Mojo.Event.tap,
                    this.join_tapped.bindAsEventListener(this));

  Mojo.Event.listen(this.controller.get('btnJoinAM'),
                    Mojo.Event.tap,
                    this.join_tappedAM.bindAsEventListener(this));
  this.connect();
};

JoinSceneAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

JoinSceneAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

JoinSceneAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
