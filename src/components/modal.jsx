var React = require('react');
var _ = require('lodash');

var Modal = React.createClass({
	getDefaultProps: function() {
		return {
			closeHandler: _.noop
		};
	},

	getInitialState: function() {
		return {
			show: true
		};
	},

	handleClose: function() {
		this.setState({ show: false });
		this.props.closeHandler();
	},

	render: function() {
		if( !this.state.show ) {
			return null;
		}

		return (
			<div className="modal">
				<div>
					<a href="javascript:;" className="close" onClick={this.handleClose}>[ Close ]</a>
					{this.props.children}
				</div>
			</div>
		);
	}
});

module.exports = Modal;