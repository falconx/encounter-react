var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var encounterSchema = Schema({
    	presence: { type: ObjectId, ref: 'Presence' },
    	creator: { type: ObjectId, ref: 'User' },
    	discoverer: { type: ObjectId, ref: 'User' }
    });

module.exports = mongoose.model('Encounter', encounterSchema);