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

	pickupPresence: function( presenceId ) {
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
				actionType: 'PICKUP_PRESENCE',
				presence: data
			};
		});
	},

	findWithinRadius: function( lng, lat, radius ) {
		return new Promise(function( resolve, rej ) {
			request
				.get('/api/presences/find/' + lng + '/' + lat + '/' + radius)
				.set('Accept', 'application/json')
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'FIND_PRESENCES',
				presences: data || []
			};
		});
	}
});

module.exports = PresenceActions;