var React = require('react');
var _ = require('lodash');

var MapConfig = require('../constants/maps').released;

var PresenceMap = require('./presence-map');

// Todo: Handle empty this.props.account.presences

var MapReleased = React.createClass({
	render: function() {
		// Center around released presences
		var bounds = new google.maps.LatLngBounds();

		_.each(this.props.account.dropped, function( presence ) {
			bounds.extend(new google.maps.LatLng( presence.location[1], presence.location[0] ));
		});

		return (
			<PresenceMap
				MapConfig={MapConfig}
				center={bounds.getCenter()}
				presences={this.props.account.dropped}
				bounds={bounds}
				{...this.props} />
		);
	}
});

module.exports = MapReleased;