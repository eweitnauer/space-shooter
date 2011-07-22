function MainAssistant() {
}

MainAssistant.prototype.create_pressed = function(evt) {

}

JoinDialogAssistant = Class.create({
	initialize: function(sceneAssistant, list_item) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
  },
	
	setup : function(widget) {
		this.widget = widget;
		this.controller.setupWidget("session_code", { textCase: Mojo.Widget.steModeLowerCase, hintText: '... enter join code' }, { });
		this.controller.get('create_button').addEventListener(Mojo.Event.tap, this.create_tapped.bindAsEventListener(this));
		this.controller.get('join_button').addEventListener(Mojo.Event.tap, this.join_tapped.bindAsEventListener(this));
		this.controller.get('cancel_button').addEventListener(Mojo.Event.tap, this.cancel_tapped.bindAsEventListener(this));
	},
	
	cancel_tapped: function() {
		this.widget.mojo.close();
	},

	create_tapped: function() {
	  this.widget.mojo.close();
	  this.sceneAssistant.create_session();
	},
	
	join_tapped: function() {
	  this.widget.mojo.close();
	  this.sceneAssistant.join_session(this.controller.get('session_code').mojo.getValue());
	}
});

MainAssistant.prototype.join_session = function(code) {
  var self = this;
  Mojo.Log.info('Joining session ' + code + '...');
  var item = {data: 'joined session', spinning: true, label: ''};
  this.sessionModel.items.push(item);
  this.controller.modelChanged(this.sessionModel, this);
  this.socket.emit('join_session', code, function(code, success) {
    item.spinning = false;
    if (success) {
      item.label = code;
    } else {
      item.label = 'ERROR';
    }
    self.controller.modelChanged(self.sessionModel, self);
  });
}

MainAssistant.prototype.create_session = function() {
  var self = this;
  Mojo.Log.info('Creating session...');
  var item = {data: 'own session', spinning: true, label: ''};
  this.sessionModel.items.push(item);
  this.controller.modelChanged(this.sessionModel, this);
  this.socket.emit('create_session', function(code, success) {
    item.spinning = false;
    if (success) {
      item.label = code;
    } else {
      item.label = 'ERROR';
    }
    self.controller.modelChanged(self.sessionModel, self);
  });
}

MainAssistant.prototype.on_connect = function(item) {
  item.label = 'CONN';
  item.label_class = '';
  item.spinning = false;
  this.controller.modelChanged(this.connectionsModel, this);
  Mojo.Log.info('Connected to ' + item.data + '!');
  if (item.timerId) {
    clearTimeout(item.timerId);
    item.timerId = null;
  }
  this.socket = item.socket;
}

MainAssistant.prototype.on_disconnect = function(item) {
  item.label = '';
  item.label_class = '';
  item.spinning = false;
  this.controller.modelChanged(this.connectionsModel, this);
  Mojo.Log.info('Disconnected from ' + item.data + '!');
  if (item.timerId) {
    clearTimeout(item.timerId);
    item.timerId = null;
  }
}

MainAssistant.prototype.on_conn_err = function(item) {
  item.label = 'ERROR';
  item.label_class = 'red';
  item.spinning = false;
  this.controller.modelChanged(this.connectionsModel, this);
  Mojo.Log.info('Could not connect / disconnect from ' + item.data + '!');
}

MainAssistant.prototype.connection_list_tapped = function(evt) {
  if (evt.item.spinning) return;
  evt.item.spinning = true;
  evt.item.timerId = setTimeout(this.on_conn_err.bind(this, evt.item), 5000);
  this.controller.modelChanged(this.connectionsModel, this); 
  if (typeof(evt.item.socket) == 'undefined') {
    evt.item.socket = io.connect(evt.item.data);
    evt.item.socket.on('connect', this.on_connect.bind(this, evt.item));
    evt.item.socket.on('disconnect', this.on_disconnect.bind(this, evt.item));
  } else if (evt.item.socket.socket.connected) {
    evt.item.socket.socket.disconnect();
  } else {
    evt.item.socket.socket.connect();
  }
}

MainAssistant.prototype.session_list_add = function() {
  this.controller.showDialog({
    template: 'main/join-dialog',
    assistant: new JoinDialogAssistant(this)
	});
}

MainAssistant.prototype.session_list_tapped = function(item) {
  Mojo.Log.info('Tapped event');
}

MainAssistant.prototype.session_list_delete = function(item) {
  Mojo.Log.info('Delete event');
}

MainAssistant.prototype.setup = function() {
//  this.controller.setupWidget("btnCreate", {}, {label: "Create", disabled: false});
//  Mojo.Event.listen(this.controller.get("btnCreate"),
//                    Mojo.Event.tap,
//                    this.create_pressed.bindAsEventListener(this));

  this.controller.setupWidget("connection-list",
      { itemTemplate: "main/item-template"},
      this.connectionsModel = {
        listTitle: "connections",
        items: [{data: 'http://192.168.0.102:9888', label: '', spinning: false},
                {data: 'http://phigames.com:9888', label: '', spinning: false}]
      }
  );
  this.controller.listen(this.controller.get("connection-list"),
                         Mojo.Event.listTap,
                         this.connection_list_tapped.bindAsEventListener(this));
                         
  this.controller.setupWidget("session-list",
      { itemTemplate: "main/item-template", addItemLabel: 'Add...'},
      this.sessionModel = {
        listTitle: "session",
        items: []
      }
  );
  this.controller.listen(this.controller.get("session-list"), Mojo.Event.listAdd,
                         this.session_list_add.bindAsEventListener(this));
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
