var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var User = require('./user');
var Presence = require('./presence');

var messageSchema = Schema({
		from: { type: ObjectId, ref: 'User' },
		presence: { type: ObjectId, ref: 'Presence' },
		message: String
	});

messageSchema.statics.getQuestion = function( presence, cb ) {
	this.findOne({ presence: presence._id }).exec(function( err, message ) {
		cb(err, message.message);
	});
}

module.exports = mongoose.model('Message', messageSchema);