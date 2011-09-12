/// Pass the connected socket, the code of the session that was joined and the
/// controller mode ('absolute' or 'relative' to this constructor.
function ControllerAssistant(socket, session_code, mode) {
  this.mode = mode;
  this.session_code = session_code;
  this.socket = socket;
  this.socket.on('data', function(code, data) {
    if (code != session_code) return;
    if (data && data.vibrate) {
      Mojo.Controller.getAppController().playSoundNotification("vibrate", "");
    }
  });
}

/// Sends the data to the game via the Phi-Server.
/// Example data: { mode: 'relative', pitch:-32, roll:4, btn1: {triggered: true,
///                 hold: false}, btn2: {triggered: false, hold: true}}.
ControllerAssistant.prototype.sendData = function() {
  var data = { mode: this.mode
    , btn1: this.btn.btn1
    , btn2: this.btn.btn2
    , pitch: this.pitch
    , roll: this.roll
    , platform: 'webos'};
  this.socket.emit('data', this.session_code, data);
  this.btn.btn1.triggered = false;
  this.btn.btn2.triggered = false;  
}

/// Returns true if the passed position belongs to the passed button (depends on
/// the controller mode).
ControllerAssistant.prototype.belongsToButton = function(btn_name, x, y) {
  if (this.mode == 'absolute') {
    var dx = x-240, dy = y-180, dist = Math.sqrt(dx*dx+dy*dy);
    if (btn_name == 'btn1' && dist<=100) return true;
    if (btn_name == 'btn2' && dist>100) return true; 
  } else if (this.mode == 'relative') {
    if (btn_name == 'btn1' && x <= 240) return true;
    if (btn_name == 'btn2' && x > 240) return true;
  }
  return false;
}

/// Updates the button information that is used the next time data is sent to the
/// Phi-Server.
ControllerAssistant.prototype.updateButton = function(btn_name, evt) {
  if (evt.type == "mousedown") {
    this.btn[btn_name].triggered = true;
    this.btn[btn_name].hold = true;
  } else if (evt.type == "mouseup") {
    this.btn[btn_name].hold = false;
  }
}

/// Handles touch events. Will update the local button states accordingly.
ControllerAssistant.prototype.handleTouch = function(evt) {
  if (this.belongsToButton('btn1', evt.x, evt.y)) this.updateButton('btn1', evt);
  if (this.belongsToButton('btn2', evt.x, evt.y)) this.updateButton('btn2', evt);
}

/// Handles orientation events. Saves the pitch and roll value for the next time
/// data is sent to the Phi-Server. 
ControllerAssistant.prototype.handleOrientation = function(evt) {
  this.pitch = evt.pitch;
  this.roll = evt.roll;
  /// a little math to make the pitch range from -180 to 180 degree  
  if (this.roll > 0) {
    if (this.pitch < 0) this.pitch = -180 - this.pitch;
    else this.pitch = 180 - this.pitch;
  }
}

ControllerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
  if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("left");
		this.controller.stageController.setWindowProperties({
      fastAccelerometer: true,
      blockScreenTimeout: true
    });
	}
	var el = this.controller.get('controller-div');
	Mojo.Event.listen(el, 'mousedown', this.handleTouch.bindAsEventListener(this), true);
  Mojo.Event.listen(el, 'mouseup', this.handleTouch.bindAsEventListener(this), true);

	this.controller.listen(document, 'orientationchange',
                         this.handleOrientation.bindAsEventListener(this));
};

ControllerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
  $$('body')[0].addClassName(this.mode+ '-bg');
  $$('body')[0].removeClassName('palm-default');
  // send data with 15 Hertz
  this.timerId = setInterval(this.sendData.bindAsEventListener(this), 1000/15);
  this.pitch = 0;
  this.roll = 0;
  this.btn = {'btn1': {hold: false, triggered: false},
              'btn2': {hold: false, triggered: false}};
};

ControllerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
 	$$('body')[0].removeClassName(this.mode + '-bg');
	$$('body')[0].addClassName('palm-default');
  // stop sending data
  if (this.timerId) {
    clearInterval(this.timerId);
    this.timerId = null;
  }
};

ControllerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
