var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var User = require('./user');
var Presence = require('./presence');

var messageSchema = Schema({
      uid: { type: ObjectId, ref: 'User' },
      pid: { type: ObjectId, ref: 'Presence' },
      message: String
    });

module.exports = mongoose.model('Message', messageSchema);