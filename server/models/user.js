var mongoose = require('mongoose');

var Presence = require('./presence');

var userSchema = mongoose.Schema({
      id: String,
      token: String,
      name: String,
      droppedPresences: [Presence.schema]
    });

module.exports = mongoose.model('User', userSchema);