var Flux = require('../flux');
var Config = require('../config');
var socket = io.connect();

var AccountStore = require('./account');
var AccountActions = require('../actions/account');

var _nearbyPresences = [];
var _messageThread = [];

var PresenceStore = Flux.createStore({
	getNearbyPresences: function() {
		return _nearbyPresences;
	},

	getMessageThread: function() {
		return _messageThread;
	}
}, function( payload ) {
	switch( payload.actionType ) {
		case 'RELEASE_PRESENCE': {
			PresenceStore.emitChange();

			socket.emit('presence:release', payload.presence);

			// We've manipulated data attached to the account so reload it
			AccountActions.loadAccount();
		}

		case 'PICKUP_PRESENCE': {
			PresenceStore.emitChange();

			// We've manipulated data attached to the account so reload it
			AccountActions.loadAccount();
			break;
		}

		case 'FIND_PRESENCES': {
			_nearbyPresences = payload.presences;
			PresenceStore.emitChange();
			break;
		}

		case 'GET_MESSAGE_THREAD': {
			_messageThread = payload.messages;
			PresenceStore.emitChange();
			break;
		}
	}
});

module.exports = PresenceStore;