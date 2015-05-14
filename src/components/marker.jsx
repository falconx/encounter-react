var React = require('react');

var Marker = React.createClass({
	componentDidMount: function() {
		this.componentDidUpdate();
	},

	componentDidUpdate: function() {
		// Create or update marker
		if( this.state && this.state.marker ) {
			this.state.marker.setOptions( this.props );
		} else {
			this.setState({
				marker: new google.maps.Marker( this.props )
			});
		}
	},

	render: function() {
		return false;
	}
});

module.exports = Marker;