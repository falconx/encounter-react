var Flux = require('../flux');

var AccountStore = require('./account');
var AccountActions = require('../actions/account');

var _nearbyPresences = [];

var PresenceStore = Flux.createStore({
	getNearbyPresences: function() {
		return _nearbyPresences;
	}
}, function( payload ) {
	switch( payload.actionType ) {
		case 'DROP_PRESENCE':
		case 'COLLECT_PRESENCE': {
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
	}
});

module.exports = PresenceStore;