var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Promise = require('es6-promise').Promise;

var presenceSchema = Schema({
			uid: { type: ObjectId, ref: 'User' },
      location: [{ type: Number, required: true }] // [lng, lat]
    });

presenceSchema.index({ location: '2dsphere' });

/**
 * Finds a collection of surrounding presences which has been dropped by other users (sorted by closest first)
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
	})
	.populate('uid', '_id photo')
	.exec(cb);
};

presenceSchema.statics.findClosest = function( lng, lat, maxDistance, uid, cb ) {
	// 
};

module.exports = mongoose.model('Presence', presenceSchema);