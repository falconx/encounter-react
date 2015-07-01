var React = require('react');
var moment = require('moment');
var _ = require('lodash');

var Link = require('react-router').Link;

var MessageActions = require('../actions/message');
var MessageStore = require('../stores/message');

var Encountered = React.createClass({
	mixins: [MessageStore.mixin],

	// Todo: Would this be more appropritate in a Mixin?
	statics: {
		dateFromObjectId: function( id, format ) {
			return moment(parseInt(id.substring(0, 8), 16) * 1000).format(format || 'MMM D YYYY');
		}
	},

	getInitialState: function() {
		return {
			directory: []
		}
	},

	componentDidMount: function() {
		MessageActions.getMessageDirectory();
	},

	storeDidChange: function() {
		this.setState({
			directory: MessageStore.getMessageDirectory()
		});
	},

	render: function() {
		return (
			<div className="message-directory">
				<ul>
					{this.state.directory.map(function( presence ) {
						var style = { backgroundImage: 'url(' + presence.user.photo + ')' };

						return (
							<li key={presence._id}>
								<Link to="message-thread" params={{ presenceId: presence._id }}>
									<div className="account-photo" style={style}></div>
									<p>Released: {Encountered.dateFromObjectId( presence._id )}</p>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
});

module.exports = Encountered;