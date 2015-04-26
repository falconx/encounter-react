var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = Schema({
      facebookId: Number, // unique
      token: String,
      name: String,
      dropped: [{ type: ObjectId, ref: 'Presence' }],
      found: [{ type: ObjectId, ref: 'Presence' }]
    });

module.exports = mongoose.model('User', userSchema);