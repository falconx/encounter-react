var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var presenceSchema = Schema({
			uid: { type: ObjectId, ref: 'User' },
      location: [{ type: Number, index: '2d' }] // [lng, lat]
    });

module.exports = mongoose.model('Presence', presenceSchema);