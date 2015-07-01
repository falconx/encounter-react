var Flux = require('../flux');

var Promise = require('es6-promise').Promise;
var request = require('superagent');

var MessageActions = Flux.createActions({
	getMessageDirectory: function() {
		return new Promise(function( resolve, rej ) {
			request
				.get('/api/messages/')
				.set('Accept', 'application/json')
				.end(function( err, res ) {
					if( !err && res.status === 200 ) {
						resolve(JSON.parse( res.text ));
					}

					rej();
				});
		}).then(function( data ) {
			return {
				actionType: 'GET_MESSAGE_DIRECTORY',
				directory: data
			};
		});
	},

	getMessageThread: function( presenceId ) {
		return new Promise(function( resolve, rej ) {
			request
				.get('/api/presences/' + presenceId + '/messages')
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
				presenceId: presenceId,
				messages: data
			};
		});
	},

	sendMessage: function( presenceId, message ) {
		return new Promise(function( resolve, rej ) {
			request
				.post('/api/presences/' + presenceId + '/messages')
				.send({
					presenceId: presenceId,
					message: message
				})
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
	}
});

module.exports = MessageActions;