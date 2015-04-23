var mongoose = require('mongoose');

var presenceSchema = mongoose.Schema({
      // location: { type: { type: String }, coordinates: [] }
      location: { type: [Number], index: '2d' }
    });

// presenceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Presence', presenceSchema);