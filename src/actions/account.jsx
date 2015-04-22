var Flux = require('../flux');

var Promise = require('es6-promise').Promise;
var request = require('superagent');

var AccountActions = Flux.createActions({
	loadAccount: function() {
		return new Promise(function( resolve, rej ) {
			request
				.get('/auth/account')
				.set('Accept', 'application/json')
				.end(function( error, response ) {
					if( !error && response.status === 200 ) {
						resolve(JSON.parse( response.text ));
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