/* Mojo events:
	//Mojo.Event.listen(el, Mojo.Event.tap, this.logEvent.bindAsEventListener(this), true);
  //Mojo.Event.listen(el, Mojo.Event.dragStart, this.logEvent.bindAsEventListener(this), true);
  //Mojo.Event.listen(el, Mojo.Event.dragging, this.logEvent.bindAsEventListener(this), true);
  //Mojo.Event.listen(el, Mojo.Event.dragEnd, this.logEvent.bindAsEventListener(this), true);
  //Mojo.Event.listen(el, Mojo.Event.hold, this.logEvent.bindAsEventListener(this), true);
	//Mojo.Event.listen(el, Mojo.Event.holdEnd, this.logEvent.bindAsEventListener(this), true);
	//Mojo.Event.listen(el, Mojo.Event.singleTap, this.logEvent.bindAsEventListener(this), true);//not working

all:
  currentTarget, returnValue, target, bubbles, srcElement, defaultPrevented,
  timeStamp, ...

mojo-tap:
 up, down, ...

mousedown, mouseup:
  layerX:236, y:154, clientX:236, shiftKey:false, currentTarget:[object HTMLDocument],
  timeStamp:Mon Aug 01 2011 12:33:40 GMT-0700 (PDT), eventPhase:3, cancelable:true, 
  bubbles:true, screenX:236, x:236, button:0, defaultPrevented:false, altKey:false, 
  keyCode:0, offsetY:154, clientY:154, view:[object DOMWindow], fromElement:null, 
  ctrlKey:false, target:[object HTMLDivElement], layerY:154, charCode:0, type:mousedown, 
  pageX:236, cancelBubble:false, pageY:154, clipboardData:undefined, metaKey:false, 
  srcElement:[object HTMLDivElement], toElement:[object HTMLDivElement], detail:1, 
  offsetX:236, relatedTarget:null, screenY:154

We don't get a mouseup event for every mousedown, but only for the last one.

dragStart, dragging:
  down, move, distance, ...
  
hold[, holdEnd]:
  down, [up], ...

We don't get and holdEnd if we hold too long (>5sec)... Broken for multitouch...
*/

function ControllerAssistant(socket, session_code) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
  this.socket = socket;
  this.socket.on('data', function(code, data) {
    Mojo.Log.info('got data from ' + code + ': ' + JSON.stringify(data));
    if (code != session_code) return;
    if (data && data.vibrate) {
      Mojo.Controller.getAppController().playSoundNotification("vibrate", "");
    }
  });
  this.session_code = session_code;
}

ControllerAssistant.prototype.logEvent = function(evt) {
  Mojo.Log.info('Got event of type ' + evt.type);
  var str=[];
  for (x in evt) str.push(x + ':' + evt[x]);
  Mojo.Log.info(str.join(', '));
}

ControllerAssistant.prototype.getLeftButtonState = function() {
  var dx = this.leftBtnX-120;
  var dy = this.leftBtnY-160;
  var result = {
    pressed: this.leftBtnPressed
  , triggered: this.leftBtnTriggered
  , angle: Math.atan2(dy, dx)
  , dist: Math.sqrt(dx*dx + dy*dy)};
  this.leftBtnTriggered = false;
  return result;
}

ControllerAssistant.prototype.getRightButtonState = function() {
  var dx = this.rightBtnX-360;
  var dy = this.rightBtnY-160;
  var result = {
    pressed: this.rightBtnPressed
  , triggered: this.rightBtnTriggered
  , angle: Math.atan2(dy, dx)
  , dist: Math.sqrt(dx*dx + dy*dy)};
  this.rightBtnTriggered = false;
  return result;
}

ControllerAssistant.prototype.sendData = function() {
  var data = { btn1: this.getLeftButtonState()
    , btn2: this.getRightButtonState()
    , pitch: this.pitch
    , roll: this.roll};
  //Mojo.Log.info('Sending data ' + JSON.stringify(data));
  this.socket.emit('data', this.session_code, data);
}

ControllerAssistant.prototype.handleMouseInteraction = function(evt) {
  Mojo.Log.info('Got event of type ' + evt.type);
  if (evt.type == "mousedown") {
    if (evt.x < 240) {
      this.leftBtnPressed = true;
      this.leftBtnTriggered = true;
      this.leftBtnX = evt.x;
      this.leftBtnY = evt.y;
    } else {
      this.rightBtnPressed = true;
      this.rightBtnTriggered = true;
      this.rightBtnX = evt.x;
      this.rightBtnY = evt.y;
    }
  } else if (evt.type == "mouseup") {
    if (evt.x < 240) this.leftBtnPressed = false;
    else this.rightBtnPressed = false;
  }
}

ControllerAssistant.prototype.handle_orientation = function(evt) {
  Mojo.Log.info(evt.position + ', ' + evt.pitch);
  this.pitch = evt.pitch;
  this.roll = evt.roll;  
}

ControllerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	/* setup widgets here */
	/* add event handlers to listen to events from widgets */
  // fix orientation
  if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("left");
		this.controller.stageController.setWindowProperties({
      fastAccelerometer: true,
      blockScreenTimeout: true
    });
	}
	var el = this.controller.get('controller-div');
	Mojo.Event.listen(el, 'mousedown', this.handleMouseInteraction.bindAsEventListener(this), true);
  Mojo.Event.listen(el, 'mouseup', this.handleMouseInteraction.bindAsEventListener(this), true);

	this.controller.listen(document, 'orientationchange',
                         this.handle_orientation.bindAsEventListener(this));
};

ControllerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
  $$('body')[0].addClassName('controller-bg');
  $$('body')[0].removeClassName('palm-default');
  // send data with 10 Hertz
  this.timerId = setInterval(this.sendData.bindAsEventListener(this), 1000/15);
  this.pitch = 0;
  this.roll = 0;
  this.leftButtonPressed = false;
  this.rightButtonPressed = false;  
};

ControllerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
 	$$('body')[0].removeClassName('controller-bg');
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
