var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var presenceSchema = Schema({
			uid: { type: ObjectId, ref: 'User' },
      location: [{ type: Number }] // [lng, lat]
    });

presenceSchema.index({ location: '2dsphere' });

/**
 * Finds a collection of surrounding presences which has been dropped by other users
 *
 * @param params
 * 		Object contianing 'lat', 'lng', 'distance', and 'userId' keys
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

module.exports = mongoose.model('Presence', presenceSchema);