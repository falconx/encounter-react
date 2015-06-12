var React = require('react');
var moment = require('moment');

var Encountered = React.createClass({
	// Todo: Would this be more appropritate in a Mixin?
	statics: {
		dateFromObjectId: function( id, format ) {
			return moment(parseInt(id.substring(0, 8), 16) * 1000).format(format || 'MMM D YYYY');
		}
	},

	render: function() {
		return (
			<div className="encountered">
				<ul>
					{this.props.account.encountered.map(function( presence ) {
						var style = { backgroundImage: 'url(' + presence.user.photo + ')' };

						return (
							<li key={presence._id}>
								<div className="account-photo" style={style}></div>
								<p>Released: {Encountered.dateFromObjectId( presence._id )}</p>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
});

module.exports = Encountered;