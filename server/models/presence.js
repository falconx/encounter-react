var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var User = require('./user');
var Message = require('./message');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

var presenceSchema = Schema({
      uid: { type: ObjectId, ref: 'User' },
      location: [{ type: Number, required: true }], // [lng, lat]
      mid: { type: ObjectId, ref: 'Message' } // Reference to the initial question
    });

presenceSchema.index({ location: '2dsphere' });

/**
 * Finds a collection of surrounding presences which has been dropped by other users (sorted by closest first).
 *
 * Presences which haven't been found but which belong to a user where a presence has been found by the current user
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
        uid: {
          $ne: params.userId
        }
      }
    }
  ], function( err, nearbyPresences ) {
    self.populate(nearbyPresences, { path: 'uid', select: '_id photo' }, function() {
      User
        .findOne({ _id: params.userId })
        .populate('found')
        .select('found')
        .exec(function( err, user ) {
          var presences = [];

          // Show any found presences but ignore others from users which the current user has already found a presence from
          var foundUsers = _.pluck(user.found, 'uid');

          _.each(nearbyPresences, function( presence ) {
            var found = !!_.findWhere(user.found, { _id: presence._id });

            if( found || _.indexOf(foundUsers, presence.uid._id) === -1 ) {
              // Add found property to identify whether the presence has already been found by the user
              presences.push(_.extend(presence, { found: found }));
            }
          });

          cb(err, presences);
        });
    });
  });
};

module.exports = mongoose.model('Presence', presenceSchema);