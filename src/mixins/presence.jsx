var Config = require('../config');

module.exports.dateFromObjectId = dateFromObjectId = function( id, format ) {
  return moment(parseInt(id.substring(0, 8), 16) * 1000);
};

module.exports.timeRemaining = timeRemaining = function( presence, unit ) {
  var created = window.created = dateFromObjectId(presence._id);
  var expiry = window.expiry = created.clone().add(Config.presence.lifespan, 'seconds');

  return expiry.diff(created, unit || 'days');
};