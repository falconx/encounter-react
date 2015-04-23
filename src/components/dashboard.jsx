var React = require('react');

var Link = require('react-router').Link;

var PresenceActions = require('../actions/presence');

var Dashboard = React.createClass({
	clickHandler: function() {
		// Temp
		// PresenceActions.dropPresence({ location: { lat: 50, lng: 50 } });
		PresenceActions.dropPresence({ location: [ 50, 50 ] });
	},

	render: function() {
		return (
			<div>
				<p>Hi {this.props.account.name} <a href="/auth/logout">Logout</a></p>
				<p><img src={'http://graph.facebook.com/' + this.props.account.id + '/picture?type=small'} /></p>
				<Link to="map-encounter">Encounter Map</Link>
				<p><button onClick={this.clickHandler}>Drop Presence</button></p>
			</div>
		);
	}
});

module.exports = Dashboard;