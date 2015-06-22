var React = require('react');
var moment = require('moment');

var socket = io.connect();

var MessageActions = require('../actions/message');
var MessageStore = require('../stores/message');

// Todo: Ensure user has encountered this user

var MessageThread = React.createClass({
	mixins: [MessageStore.mixin],

	// Todo: Would this be more appropritate in a Mixin?
	statics: {
		dateFromObjectId: function( id, format ) {
			return moment(parseInt(id.substring(0, 8), 16) * 1000).format(format || 'MMM D YYYY');
		}
	},

	getInitialState: function() {
		return {
			messages: []
		};
	},

	componentDidMount: function() {
		var self = this;

		MessageActions.getMessageThread( this.props.params.presenceId );

		socket.on('message:sent', function( message ) {
			MessageActions.getMessageThread( self.props.params.presenceId );
		});
	},

	storeDidChange: function() {
		this.setState({
			messages: MessageStore.getMessageThread()
		});
	},

	submitMessageHandler: function( e ) {
		e.preventDefault();

		var presenceId = this.props.params.presenceId;
		var message = this.refs.message.getDOMNode().value;

		MessageActions.sendMessage( presenceId, message );

		// Clear message field
		this.refs.message.getDOMNode().value = '';
	},

	render: function() {
		var self = this;

		return (
			<div className="message-thread">
				<ul>
					{this.state.messages.map(function( message ) {
						var className = message.user === self.props.account._id ? 'own' : '';

						return (
							<li key={message._id} className={className}>
								<small>{MessageThread.dateFromObjectId(message._id)}</small>
								<div>{message.message}</div>
							</li>
						);
					})}
				</ul>
				<form onSubmit={this.submitMessageHandler}>
					<label htmlFor="message">Message:</label>
					<textarea name="message" ref="message"></textarea>
					<div>
						<input type="submit" value="Send" />
					</div>
				</form>
			</div>
		);
	}
});

module.exports = MessageThread;