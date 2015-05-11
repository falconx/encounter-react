var React = require('react');
var Navigation = require('react-router').Navigation;
var _ = require('lodash');

var MapConfig = require('../constants/maps').released;

var Modal = require('./modal');
var PresenceMap = require('./presence-map');

var MapReleased = React.createClass({
	mixins: [Navigation],

	render: function() {
		if( this.props.account.dropped.length ) {
			// Center around released presences
			var bounds = new google.maps.LatLngBounds();

			_.each(this.props.account.dropped, function( presence ) {
				bounds.extend(new google.maps.LatLng( presence.location[1], presence.location[0] ));
			});

			return (
				<PresenceMap
					mapOptions={MapConfig.options}
					center={bounds.getCenter()}
					presences={this.props.account.dropped}
					bounds={bounds}
					{...this.props} />
			);
		}

		return (
			<Modal closeHandler={this.goBack}>
				<p>You've not yet released any presences.</p>
			</Modal>
		);
	}
});

module.exports = MapReleased;