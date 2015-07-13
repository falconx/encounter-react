var Flux = require('../flux');
var socket = io.connect();

var _encounters = [];
var _messages = [];

var MessageStore = Flux.createStore({
	getEncounters: function() {
		return _encounters;
	},

	getEncounter: function( encounterId ) {
		return _.findWhere(_encounters, { '_id': encounterId });
	},

	getMessageThread: function() {
		return _messages;
	}
}, function( payload ) {
	switch( payload.actionType ) {
		case 'GET_ENCOUNTERS':
			_encounters = payload.encounters;
			MessageStore.emitChange();
			break;

		case 'GET_MESSAGE_THREAD':
			_messages = payload.messages;
			MessageStore.emitChange();
			break;

		case 'SEND_MESSAGE':
			MessageStore.emitChange();
			socket.emit('message:sent', payload.message);
			break;
	}
});

module.exports = MessageStore;