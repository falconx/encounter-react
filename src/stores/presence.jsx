var Flux = require('../flux');

var AccountStore = require('./account');
var AccountActions = require('../actions/account');

var PresenceStore = Flux.createStore({

	// 
	
}, function( payload ) {
	switch( payload.actionType ) {
		case 'DROP_PRESENCE':
			PresenceStore.emitChange();

			// We've manipulated data attached to the account so reload it
			AccountActions.loadAccount();
			break;
	}
});

module.exports = PresenceStore;