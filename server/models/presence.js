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

          // Show any encountered presences but ignore others from users which the current user has already encountered a presence from
          var encounteredUsers = _.pluck(user.encountered, 'user');

          _.each(nearbyPresences, function( presence ) {
            var encountered = !!_.findWhere(user.encountered, { _id: presence._id });

            if( encountered || _.indexOf(encounteredUsers, presence.user._id) === -1 ) {
              // Add encountered property to identify whether the presence has already been encountered by the user
              presences.push(_.extend(presence, { encountered: encountered }));
            }
          });

          cb(err, presences);
        });
    });
  });
};

module.exports = mongoose.model('Presence', presenceSchema);