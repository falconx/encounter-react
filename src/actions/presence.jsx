var Flux = require('../flux');

var Promise = require('es6-promise').Promise;
var request = require('superagent');

var PresenceActions = Flux.createActions({
	/**
	 * @function encounter
	 *
	 * @param presenceId {String} Id of the presence to encounter
	 * @param response {optional:String} Response message
	 */
	encounter: function( presenceId, response ) {
		return new Promise(function( resolve, rej ) {
			request
				.post('/api/presences/' + presenceId + '/encounter')
				.send({ response: response })
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'ENCOUNTER_PRESENCE',
				presence: data
			};
		});
	},

	release: function( location, question ) {
		return new Promise(function( resolve, rej ) {
			request
				.post('/api/presences')
				.send({
					location: location,
					question: question
				})
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'RELEASE_PRESENCE',
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