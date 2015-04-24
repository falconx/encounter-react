var mongoose = require('mongoose');

var Presence = require('./presence');

var userSchema = mongoose.Schema({
      id: String,
      token: String,
      name: String,
      dropped: [Presence.schema]
      // found: [Preference.schema]
    });

module.exports = mongoose.model('User', userSchema);