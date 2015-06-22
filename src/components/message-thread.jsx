var React = require('react');

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');

// Todo: Ensure user has encountered this user

var MessageThread = React.createClass({
	mixins: [PresenceStore.mixin],

	getInitialState: function() {
		return {
			messages: []
		};
	},

	componentDidMount: function() {
		PresenceActions.getMessageThread( this.props.params.presenceId );
	},

	storeDidChange: function() {
		this.setState({
			messages: PresenceStore.getMessageThread()
		});
	},

	render: function() {
		return (
			<ul>
				{this.state.messages.map(function( message ) {
					return (
						<li key={message._id}>
							<p>{message.message}</p>
						</li>
					);
				})}
			</ul>
		);
	}
});

module.exports = MessageThread;