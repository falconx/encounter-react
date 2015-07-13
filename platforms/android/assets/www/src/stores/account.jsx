var Flux = require('../flux');

var _account = null;

var AccountStore = Flux.createStore({
	getAccount: function() {
		return _account;
	}
}, function( payload ) {
	switch( payload.actionType ) {
		case 'LOAD_ACCOUNT':
			_account = payload.account;
			AccountStore.emitChange();
			break;
	}
});

module.exports = AccountStore;