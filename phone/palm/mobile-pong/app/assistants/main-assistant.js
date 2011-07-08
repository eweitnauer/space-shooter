function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MainAssistant.prototype.publish = function(msg) {
  Mojo.Log.info("sending message to " + this.joined);  
  this.socket.emit('data', this.joined, msg);
  //if (this.con_btn_model.value) {
  //  this.socket_local.publish('data', {id: this.dev_id, data:msg});
  //} else {
  //  this.client_remote.publish(this.dev_path, {id: this.dev_id, data:msg});
  //}
}

MainAssistant.prototype.handle_orientation = function(event) {
  //Mojo.Log.info("Orientation change position: ", event.position, " pitch: ", event.pitch,
  //    " roll: ", event.roll);
  this.controller.get("pitch").update("Pitch = " + event.pitch);
	this.controller.get("roll").update("Roll = " + event.roll);
	
	if (this.send_btn_model.value) {
	  this.publish({pitch: event.pitch, roll: event.roll});
	}
};

MainAssistant.prototype.handle_acceleration = function(event) {
	this.controller.get("accx").update("X = " + event.accelX);
	this.controller.get("accy").update("Y = " + event.accelY);
	this.controller.get("accz").update("Z = " + event.accelZ);
	this.controller.get("time").update("Time (msec) = " + event.time);
}

MainAssistant.prototype.setupSocketIo = function() {
  Mojo.Log.info("Connecting to http://192.168.0.102:9888...");
  this.socket = io.connect('http://192.168.0.102:9888');
  if (this.socket) Mojo.Log.info("...successfully connected!");
};

MainAssistant.prototype.fast_acc_btn_pressed = function(event) {
  this.controller.stageController.setWindowProperties({fastAccelerometer: event.value});
}

MainAssistant.prototype.btn_connect_pressed = function(event) {
  this.setupSocketIo();
}

MainAssistant.prototype.btn_join_pressed = function(event) {
  var code = this.controller.get('txtCode').mojo.getValue();
  Mojo.Log.info("joining session " + code + "...");
  this.joined = code;
  this.socket.emit('join_session', code, function(code, success) {
    this.joined = code;
    Mojo.Log.info(success); 
  });
}

MainAssistant.prototype.setupWidgets = function() {
  this.controller.setupWidget("btnConnect", {}, {label: "Connect", disabled: false});
  Mojo.Event.listen(this.controller.get("btnConnect"),
                    Mojo.Event.tap,
                    this.btn_connect_pressed.bindAsEventListener(this)); 
  
  this.controller.setupWidget("btnJoin", {}, {label: "Join Session", disabled: false});
  Mojo.Event.listen(this.controller.get("btnJoin"),
                    Mojo.Event.tap,
                    this.btn_join_pressed.bindAsEventListener(this)); 

  this.controller.setupWidget("txtCode", {
      hintText: $L("enter session code"),
      multiline: false,
      enterSubmits: false,
      focus: true
  }, {value:'' ,
      disabled: false
  }); 
  
  this.send_btn_model = {
  	value : false,
		disabled: false 
	};
	this.controller.setupWidget('publish-data', {}, this.send_btn_model);

  this.con_btn_model = {
  	value : true,
		disabled: false 
	};
	this.controller.setupWidget('connection-type',
	                            {trueLabel: 'local', falseLabel: 'remote'},
	                            this.con_btn_model);

  this.fast_acc_btn_model = {
  	value : false,
		disabled: false 
	};
	this.controller.setupWidget('fast-acc', {}, this.fast_acc_btn_model);
  Mojo.Event.listen(this.controller.get('fast-acc'),
                    Mojo.Event.propertyChange,
                    this.fast_acc_btn_pressed.bindAsEventListener(this));
}

MainAssistant.prototype.setup = function() {
  this.setupWidgets();
  if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("up"); // free
		// fastAccelerometer: 30 Hertz, without: 4 Hertz
		this.controller.stageController.setWindowProperties({fastAccelerometer: this.fast_acc_btn_model.value});
	}
	this.controller.listen(document, 'orientationchange',
                         this.handle_orientation.bindAsEventListener(this));
  this.controller.listen(document, 'acceleration',
                         this.handle_acceleration.bindAsEventListener(this));

};

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
