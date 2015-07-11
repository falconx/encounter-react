var React = require('react');
var Link = require('react-router').Link;

var Config = require('../config');

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');
var HelpersMixing = require('../mixins/helpers');

var Dashboard = React.createClass({
	mixins: [HelpersMixing],

	render: function() {
		var self = this;
		var account = this.props.account;
		var accountPhotoStyle = { backgroundImage: 'url(' + account.photo + ')' };

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
						return (
							<li key={presence._id}>
								<ul>
									<li>{presence._id}</li>
									<li>{JSON.stringify(presence.location)}</li>
									<li>Released {self.getDateReleased(presence)}</li>
									<li>Expires {self.getDateExpiry(presence)}</li>
									<li>{parseInt(self.getTimeRemaining(presence))} days / {parseInt(self.getTimeRemaining(presence, 'minutes'))} minutes remaining</li>
								</ul>
							</li>
						);
					})}
				</ol>

				<h2>Encounterd Presences</h2>
				<ol>
					{account.encountered.map(function( presence ) {
						return (
							<li key={presence._id}>
								<ul>
									<li>{presence._id}</li>
									<li>{JSON.stringify(presence.location)}</li>
									<li>Expires {self.getDateExpiry(presence)}</li>
									<li>{parseInt(self.getTimeRemaining(presence))} days / {parseInt(self.getTimeRemaining(presence, 'minutes'))} minutes remaining</li>
								</ul>
							</li>
						);
					})}
				</ol>
			</div>
		);
	}
});

module.exports = Dashboard;