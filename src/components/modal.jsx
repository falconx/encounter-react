var React = require('react');
var _ = require('lodash');

var Modal = React.createClass({
	getDefaultProps: function() {
		return {
			show: true,

			// This is typically where the parent component is responsible for closing the modal (toggling props.show).
			// If a handler is not provided then the close button will not be rendered.
			closeHandler: _.noop
		};
	},

	render: function() {
		if( !this.props.show ) {
			return false;
		}

		return (
			<div className="modal">
				<div>
					{this.props.closeHandler !== _.noop &&
						<a href="javascript:;" className="close" onClick={this.props.closeHandler}>[ Close ]</a>
					}
					{this.props.children}
				</div>
			</div>
		);
	}
});

module.exports = Modal;