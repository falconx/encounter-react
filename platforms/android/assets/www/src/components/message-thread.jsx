var React = require('react');
var socket = io.connect();

var Config = require('../config');

var MessageActions = require('../actions/message');
var MessageStore = require('../stores/message');
var HelpersMixin = require('../mixins/helpers');

// Todo: Ensure user has encountered this user

var MessageThread = React.createClass({
	mixins: [MessageStore.mixin, HelpersMixin],

	getInitialState: function() {
		return {
			messages: [],
			charCount: Config.messaging.maxlength
		};
	},

	componentDidMount: function() {
		var self = this;
		var encounterId = this.props.params.encounterId;

		MessageActions.getMessageThread( encounterId );

		socket.on('message:sent', function( message ) {
			MessageActions.getMessageThread( encounterId );
		});

		MessageActions.getEncounters();
	},

	storeDidChange: function() {
		var encounterId = this.props.params.encounterId;

		this.setState({
			encounter: MessageStore.getEncounter( encounterId ),
			messages: MessageStore.getMessageThread( encounterId )
		});
	},

	submitMessageHandler: function( e ) {
		e.preventDefault();

		var message = this.refs.message.getDOMNode().value;

		MessageActions.sendMessage( this.state.encounter.presence._id, message );

		// Clear message field
		this.refs.message.getDOMNode().value = '';

		// Reset remaining character count
		this.setState({
			charCount: Config.messaging.maxlength
		});
	},

	handleMessageChange: function() {
		this.setState({
			charCount: Config.messaging.maxlength - this.refs.message.getDOMNode().value.length
		});
	},

	render: function() {
		var self = this;

		return (
			<div className="message-thread">
				<ul>
					{this.state.messages.map(function( message ) {
						var className = message.from === self.props.account._id ? 'own' : '';

						return (
							<li key={message._id} className={className}>
								<small>{self.getDateCreated(message._id)}</small>
								<div>{message.message}</div>
							</li>
						);
					})}
				</ul>
				<form onSubmit={this.submitMessageHandler}>
					<label htmlFor="message">Message:</label>
					<div>
						<small>{this.state.charCount} Characters remaining</small>
					</div>
					<textarea name="message" ref="message" placeholder="type a message" maxLength={Config.messaging.maxlength} onChange={this.handleMessageChange}></textarea>
					<div>
						<input type="submit" value="Send" />
					</div>
				</form>
			</div>
		);
	}
});

module.exports = MessageThread;