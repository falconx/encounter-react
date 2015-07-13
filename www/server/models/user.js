var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var userSchema = Schema({
		facebookId: Number, // unique
		token: String,
		name: String,
		photo: String, // Path to profile image using Facebook Graph API
		released: [{ type: ObjectId, ref: 'Presence' }],
		encountered: [{ type: ObjectId, ref: 'Presence' }]
    });

module.exports = mongoose.model('User', userSchema);