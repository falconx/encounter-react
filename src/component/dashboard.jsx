var React = require('react');

var Dashboard = React.createClass({
	render: function() {
		return (
			<div>
				<p>Hi {this.props.account.name} <a href="/auth/logout">Logout</a></p>
				<img src={'http://graph.facebook.com/' + this.props.account.id + '/picture?type=small'} />
			</div>
		);
	}
});

module.exports = Dashboard;