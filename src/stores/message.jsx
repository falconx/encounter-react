var Flux = require('../flux');
var _ = require('lodash');

var socket = io.connect();

var AccountStore = require('./account');
var AccountActions = require('../actions/account');

var _directory = [];

// Map indexed by presenceId
var _messages = {};

var MessageStore = Flux.createStore({
	getMessageDirectory: function() {
		return _directory;
	},

	getMessageThread: function( presenceId ) {
		return _messages[presenceId];
	}
}, function( payload ) {
	switch( payload.actionType ) {
		case 'GET_MESSAGE_DIRECTORY': {
			_directory = payload.directory;
			MessageStore.emitChange();
			break;
		}

		case 'GET_MESSAGE_THREAD': {
			_messages[payload.presenceId] = payload.messages;
			MessageStore.emitChange();
			break;
		}

		case 'SEND_MESSAGE': {
			_messages.push( payload.message );

			socket.emit('message:sent', payload.message);

			MessageStore.emitChange();
		}
	}
});

module.exports = MessageStore;