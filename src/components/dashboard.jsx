var React = require('react');

var Link = require('react-router').Link;

var Dashboard = React.createClass({
	render: function() {
		return (
			<div>
				<p>Hi {this.props.account.name} <a href="/auth/logout">Logout</a></p>
				<p><img src={'http://graph.facebook.com/' + this.props.account.id + '/picture?type=small'} /></p>
				<Link to="map-encounter">Encounter Map</Link>
			</div>
		);
	}
});

module.exports = Dashboard;