var Config = require('../config');

var HelpersMixin = {
  dateFromObjectId: function( id, format ) {
    var date = moment(parseInt(id.substring(0, 8), 16) * 1000);

    return (format) ? date.format(format) : date;
  },

  getTimeRemaining: function( presence, unit ) {
    var expiry = this.getDateExpiry(presence, true);

    return expiry.diff(moment(), unit || 'days', true);
  },

  getDateCreated: function( objectId, format ) {
    return this.dateFromObjectId(objectId, format || Config.dateFormat);
  },

  getDateReleased: function( presence ) {
    return this.getDateCreated(presence._id);
  },

  getDateExpiry: function( presence, raw ) {
    var created = this.dateFromObjectId(presence._id);
    var expiry = created.clone().add(Config.presence.lifespan, 'seconds');

    return (raw) ? expiry : expiry.format(Config.dateFormat);
  }
};

module.exports = HelpersMixin;