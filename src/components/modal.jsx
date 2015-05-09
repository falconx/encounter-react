var React = require('react');
var _ = require('lodash');

var Modal = React.createClass({
	getDefaultProps: function() {
		return {
			show: true,
			closeHandler: _.noop
		};
	},

	render: function() {
		if( !this.props.show ) {
			return null;
		}

		return (
			<div className="modal">
				<div>
					<a href="javascript:;" className="close" onClick={this.props.closeHandler}>[ Close ]</a>
					{this.props.children}
				</div>
			</div>
		);
	}
});

module.exports = Modal;