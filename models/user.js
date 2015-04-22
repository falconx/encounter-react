var mongoose = require('mongoose');

// var Presence = require('./presence');

var userSchema = mongoose.Schema({
      id: String,
      token: String,
      name: String
      // droppedPresences: [Presence]
    });

userSchema.methods.dropPresence = function( lat, lng ) {
  this.droppedPresences.push([ lng, lat ]);
};

module.exports = mongoose.model('User', userSchema);