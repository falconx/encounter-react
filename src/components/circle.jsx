var React = require('react');

var Circle = React.createClass({
	componentDidMount: function() {
		this.componentDidUpdate();
	},

	componentDidUpdate: function() {
		var options = _.extend({}, this.props);

		// Create or update circle
		if( this.state && this.state.circle ) {
			this.state.circle.setOptions( options );
		} else {
			this.setState({
				circle: new google.maps.Circle( options )
			});
		}
	},

	render: function() {
		return false;
	}
});

module.exports = Circle;