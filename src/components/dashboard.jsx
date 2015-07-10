var React = require('react');
var Link = require('react-router').Link;

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');
var PresenceMixin = require('../mixins/presence');

var _ = require('lodash');

var Dashboard = React.createClass({
	mixins: ['PresenceMixin'],

	render: function() {
		var account = this.props.account;
		var accountPhotoStyle = { backgroundImage: 'url(' + account.photo + ')' };
		var usersFound = _.uniq(_.map(account.encountered, function( presence ) { return presence.creator; }));

		return (
			<div>
				<p>Hi {account.name} ({account._id}) <a href="/api/auth/logout">Logout</a></p>
				<p><div className="account-photo" style={accountPhotoStyle}></div></p>
				<p><Link to="map-encounter">Encounter</Link></p>
				<p><Link to="map-released">My Presences</Link></p>
				<p><Link to="messages">Messages</Link></p>

				<h2>Released Presences</h2>
				<ol>
					{account.released.map(function( presence ) {
						return <li key={presence._id}>{presence._id} {JSON.stringify(presence.location)} {this.timeRemaining(presence)} days remaining</li>;
					})}
				</ol>

				<h2>Encounterd Presences</h2>
				<ol>
					{account.encountered.map(function( presence ) {
						return <li key={presence._id}>{presence._id} {JSON.stringify(presence.location)}</li>;
					})}
				</ol>

				<h2>Encounterd Users</h2>
				<ol>
					{usersFound.map(function( userId ) {
						return <li key={userId}>{userId}</li>
					})}
				</ol>
			</div>
		);
	}
});

module.exports = Dashboard;