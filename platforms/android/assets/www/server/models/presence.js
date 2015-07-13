var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var moment = require('moment');

var User = require('./user');
var Message = require('./message');

// Todo: Get moment().add value from a global config

var presenceSchema = Schema({
      created: { type: Date, default: Date.now, required: true },
      creator: { type: ObjectId, ref: 'User' },
      location: [{ type: Number, required: true }] // [lng, lat]
    });

presenceSchema.index({ location: '2dsphere' });

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
      '$geoNear': {
        'near': {
          'type': 'Point',
          'coordinates': [parseFloat(params.lng), parseFloat(params.lat)],
        },
        'maxDistance': parseFloat(params.distance), // Meters
        'spherical': true,
        'distanceField': 'distance'
      }
    },
    {
      '$match': {
        'created': { '$lt': moment().add(3, 'days').toDate() }, // Exclude expired presences
        'creator': { '$ne': params.userId } // Exclude own presences
      }
    }
  ], function( err, nearbyPresences ) {
    self.populate(nearbyPresences, [{ path: 'creator', select: 'photo' }], function() {
      var presences = [];
      var i = 0;

      // No presences found nearby
      if( !nearbyPresences.length ) {
        cb(err, []);
      }

      // Attach question for each presence
      _.each(nearbyPresences, function( presence ) {
        new Promise(function( resolve, rej ) {
          // Add question to response
          Message.findOne({ 'presence': presence._id }).select('message').exec(function( err, message ) {
            _.extend(presence, { 'question': message.message });

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
};

module.exports = mongoose.model('Presence', presenceSchema);