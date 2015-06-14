var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var User = require('./user');
var Message = require('./message');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

var presenceSchema = Schema({
      user: { type: ObjectId, ref: 'User' },
      location: [{ type: Number, required: true }], // [lng, lat]
      message: { type: ObjectId, ref: 'Message' } // Reference to the initial question
    });

presenceSchema.index({ location: '2dsphere' });

/**
 * Finds a collection of surrounding presences which has been dropped by other users (sorted by closest first).
 *
 * Presences which haven't been encountered but which belong to a user where a presence has been encountered by the current user
 * will be ignored.
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
        user: {
          $ne: params.userId
        }
      }
    }
  ], function( err, nearbyPresences ) {
    self.populate(nearbyPresences, [{ path: 'user', select: '_id photo' }, { path: 'message' }], function() {
      User
        .findOne({ _id: params.userId })
        .populate('encountered')
        .select('encountered')
        .exec(function( err, user ) {
          var presences = [];

          // Return encountered presences and all others belonging to the owner as encountered
          var encounteredUsers = _.map(user.encountered, function( encountered ) {
            return encountered.user.toString();
          });

          _.each(nearbyPresences, function( presence ) {
            if( _.indexOf(encounteredUsers, presence.user._id.toString()) !== -1 ) {
              // Add encountered property to identify whether the presence has already been encountered by the user
              _.extend(presence, { encountered: true });
            }

            presences.push( presence );
          });

          cb(err, presences);
        });
    });
  });
};

module.exports = mongoose.model('Presence', presenceSchema);