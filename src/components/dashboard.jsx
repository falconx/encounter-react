var React = require('react');

var Link = require('react-router').Link;

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');

var Dashboard = React.createClass({
	render: function() {
		var account = this.props.account;

		return (
			<div>
				<p>Hi {account.name} <a href="/auth/logout">Logout</a></p>
				<p><img src={'http://graph.facebook.com/' + account.facebookId + '/picture?type=small'} /></p>
				<p><Link to="map-encounter">Encounter Map</Link></p>
				<p><Link to="map-released">Released Presences Map</Link></p>

				<h2>Released Presences</h2>
				<ol>
					{account.dropped.map(function( presence ) {
						return <li key={presence._id}>{JSON.stringify(presence.location)}</li>;
					})}
				</ol>

				<h2>Found Presences</h2>
				<ol>
					{account.found.map(function( presence ) {
						return <li key={presence._id}>{JSON.stringify(presence.location)}</li>;
					})}
				</ol>
			</div>
		);
	}
});

module.exports = Dashboard;