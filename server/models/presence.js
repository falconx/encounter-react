var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var presenceSchema = Schema({
			uid: { type: ObjectId, ref: 'User' },
      location: [{ type: Number }] // [lng, lat]
    });

presenceSchema.index({ location: '2dsphere' });

/**
 * @param params
 * 		Object contianing 'lat', 'lng', and 'distance' keys
 */
presenceSchema.statics.findWithinRadius = function( params, cb ) {
	return this.find({
					location: {
						$nearSphere: {
							$geometry: {
								type: 'Point',
								coordinates: [params.lng, params.lat]
							},
							$maxDistance: params.distance // Meters
						}
					}
				}, cb);
};

module.exports = mongoose.model('Presence', presenceSchema);	