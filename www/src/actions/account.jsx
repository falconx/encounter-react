var Flux = require('../flux');

var Promise = require('es6-promise').Promise;
var request = require('superagent');

var AccountActions = Flux.createActions({
	loadAccount: function() {
		return new Promise(function( resolve, rej ) {
			request
				.get('/api/account')
				.set('Accept', 'application/json')
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'LOAD_ACCOUNT',
				account: data
			};
		});
	}
});

module.exports = AccountActions;