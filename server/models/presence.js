var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

var presenceSchema = Schema({
      uid: { type: ObjectId, ref: 'User' },
      location: [{ type: Number, required: true }] // [lng, lat]
    });

presenceSchema.index({ location: '2dsphere' });

/**
 * Finds a collection of surrounding presences which has been dropped by other users (sorted by closest first)
 *
 * @param params
 *    Object contianing 'lng', 'lat', 'distance', and 'userId' keys
 */
presenceSchema.statics.findWithinRadius = function( params, cb ) {
  var self = this;

  this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(params.lng), parseFloat(params.lat)],
        },
        maxDistance: parseFloat(params.distance), // Meters
        spherical: true,
        distanceField: 'distance'
      }
    },
    {
      $match: {
        uid: {
          $ne: params.userId
        }
      }
    }
  ], function( err, presences ) {
    self.populate( presences, { path: 'uid', select: '_id photo' }, cb);
  });
};

presenceSchema.statics.findClosest = function( lng, lat, maxDistance, uid, cb ) {
  // 
};

module.exports = mongoose.model('Presence', presenceSchema);