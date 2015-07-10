var Config = require('../config');

module.exports.dateFromObjectId = dateFromObjectId = function( id, format ) {
  var date = moment(parseInt(id.substring(0, 8), 16) * 1000);

  return (format) ? date.format(format) : date;
};

module.exports.timeRemaining = timeRemaining = function( presence, unit ) {
  var created = window.created = dateFromObjectId(presence._id);
  var expiry = window.expiry = created.clone().add(Config.presence.lifespan, 'seconds');

  return expiry.diff(moment(), unit || 'days', true);
};