var Flux = require('../flux');

var Promise = require('es6-promise').Promise;
var request = require('superagent');

var MessageActions = Flux.createActions({
	getEncounters: function() {
		return new Promise(function( resolve, rej ) {
			request
				.get('/api/encounters')
				.set('Accept', 'application/json')
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'GET_ENCOUNTERS',
				encounters: data
			};
		});
	},

	getMessageThread: function( encounterId ) {
		return new Promise(function( resolve, rej ) {
			request
				.get('/api/encounters/' + encounterId + '/messages')
				.set('Accept', 'application/json')
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'GET_MESSAGE_THREAD',
				messages: data
			};
		});
	},

	sendMessage: function( presenceId, message ) {
		return new Promise(function( resolve, rej ) {
			request
				.post('/api/presences/' + presenceId + '/messages')
				.send({ message: message })
				.set('Accept', 'application/json')
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'SEND_MESSAGE',
				message: data
			};
		});
	},
});

module.exports = MessageActions;