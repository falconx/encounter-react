var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var User = require('./user');
var Message = require('./message');
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

var presenceSchema = Schema({
      user: { type: ObjectId, ref: 'User' },
      location: [{ type: Number, required: true }] // [lng, lat]
    });

presenceSchema.index({ location: '2dsphere' });

presenceSchema.pre('save', function( next ) {
  var self = this;

  User.findOne({ _id: this.user }, 'released', function( err, user ) {
    if( err ) {
      next(err);
    } else if( user.released.length >= 3 ) {
      var message = 'Max released count reached';

      console.log('fail');
      self.invalidate('released', message);
      next(new Error(message));
    } else {
      next();
    }
  });
});

/**
 * Finds a collection of surrounding presences which has been dropped by other users (sorted by closest first)
 *
 * Presences which haven't been encountered but which belong to a user where a presence has been encountered by the current user
 * will be ignored
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
    self.populate(nearbyPresences, [{ path: 'user', select: '_id photo' }], function() {
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

          var i = 0;

          _.each(nearbyPresences, function( presence ) {
            new Promise(function( resolve, rej ) {
              // Add question to response
              Message.getQuestion(presence, function( err, question ) {
                _.extend(presence, { question: question });

                presences.push( presence );

                i++;

                resolve();
              });
            }).then(function() {
              // Loop until we have pushed all nearby presences
              if( i === nearbyPresences.length ) {
                cb(err, presences);
              }
            });
          });
        });
    });
  });
};

module.exports = mongoose.model('Presence', presenceSchema);