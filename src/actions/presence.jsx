var Flux = require('../flux');

var Promise = require('es6-promise').Promise;
var request = require('superagent');

var PresenceActions = Flux.createActions({
	dropPresence: function( presence ) {
		return new Promise(function( resolve, rej ) {
			request
				.post('/api/presences/dropped')
				.send({ presence: presence })
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'DROP_PRESENCE',
				presence: data
			};
		});
	},

	collectPresence: function( presenceId ) {
		return new Promise(function( resolve, rej ) {
			request
				.post('/api/presences/found')
				.send({ presenceId: presenceId })
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'COLLECT_PRESENCE',
				presence: data
			};
		});
	}
});

module.exports = PresenceActions;