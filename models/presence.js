var mongoose = require('mongoose');

var presenceSchema = mongoose.Schema({
      userId: Number,
      location: { type: [Number], index: '2d' }
    });

module.exports = mongoose.model('Presence', presenceSchema);