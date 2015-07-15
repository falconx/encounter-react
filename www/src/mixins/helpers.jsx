var Config = require('../config');

require('moment-duration-format');

var HelpersMixin = {
  dateFromObjectId: function( id, format ) {
    var date = moment(parseInt(id.substring(0, 8), 16) * 1000);

    return (format) ? date.format(format) : date;
  },

  getTimeRemaining: function( presence, unit ) {
    var expiry = this.getDateExpiry(presence, true);
    var diff = expiry.diff(moment());

    if( unit ) {
      return expiry.diff(moment(), unit, true);
    }

    return moment.duration(diff).format('h[h] mm[m]');
  },

  getDateCreated: function( objectId, format ) {
    return this.dateFromObjectId(objectId, format || Config.dateFormat);
  },

  getDateReleased: function( presence ) {
    return this.getDateCreated(presence._id);
  },

  getDateExpiry: function( presence, raw ) {
    var created = this.dateFromObjectId(presence._id);
    // var created = moment(presence.created);
    var expiry = created.clone().add(Config.presence.lifespan, 'seconds');

    return (raw) ? expiry : expiry.format(Config.dateFormat);
  },

  getEncounteredUsers: function( account ) {
    // Todo: Reponding to a message doesn't appear as a encountered user for the creator
    return _.uniq(_.map(account.encountered, function( encounter ) {
      return encounter.creator;
    }));
  }
};

module.exports = HelpersMixin;