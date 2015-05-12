var React = require('react');

var Circle = React.createClass({
	componentDidMount: function() {
		this.componentDidUpdate();
	},

	componentDidUpdate: function() {
		// Create or update circle
		if( this.state && this.state.circle ) {
			this.state.circle.setOptions( this.props );
		} else {
			this.setState({
				circle: new google.maps.Circle( this.props )
			});
		}
	},

	render: function() {
		return false;
	}
});

module.exports = Circle;