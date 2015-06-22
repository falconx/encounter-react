var Flux = require('../flux');
var socket = io.connect();

var AccountStore = require('./account');
var AccountActions = require('../actions/account');

var _messageThread = [];

var MessageStore = Flux.createStore({
	getMessageThread: function() {
		return _messageThread;
	}
}, function( payload ) {
	switch( payload.actionType ) {
		case 'GET_MESSAGE_THREAD': {
			_messageThread = payload.messages;
			MessageStore.emitChange();
			break;
		}

		case 'SEND_MESSAGE': {
			_messageThread.push( payload.message );

			socket.emit('message:sent', payload.message);

			MessageStore.emitChange();
		}
	}
});

module.exports = MessageStore;