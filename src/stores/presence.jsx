var Flux = require('../flux');

var AccountStore = require('./account');

var PresenceStore = Flux.createStore({

	getDroppedPresences: function() {
		var account = AccountStore.getAccount();

		if( account && account.droppedPresences && account.droppedPresences.length ) {
			return account.droppedPresences;
		}

		return [];
	}

}, function( payload ) {

	switch( payload.actionType ) {
		case 'DROP_PRESENCE':
			// Todo
			PresenceStore.emitChange();
			break;
	}

});

module.exports = PresenceStore;