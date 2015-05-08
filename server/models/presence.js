var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Promise = require('es6-promise').Promise;

var presenceSchema = Schema({
			uid: { type: ObjectId, ref: 'User' },
      location: [{ type: Number }] // [lng, lat]
    });

presenceSchema.index({ location: '2dsphere' });

/**
 * Finds a collection of surrounding presences which has been dropped by other users
 *
 * @param params
 * 		Object contianing 'lng', 'lat', 'distance', and 'userId' keys
 */
presenceSchema.statics.findWithinRadius = function( params, cb ) {
	return this.find({
		uid: {
			$ne: params.userId
		},
		location: {
			$nearSphere: {
				$geometry: {
					type: 'Point',
					coordinates: [parseFloat(params.lng), parseFloat(params.lat)]
				},
				$maxDistance: params.distance // Meters
			}
		}
	}, cb);
};

presenceSchema.statics.findClosest = function( params, cb ) {
	return new Promise(function( resolve ) {
		presenceSchema.statics.findWithinRadius( params ).then(function( presences ) {
			if( presences && presences.length ) {
				resolve(presences[0]);
			}

			return resolve([]);
		});
	});
};

module.exports = mongoose.model('Presence', presenceSchema);