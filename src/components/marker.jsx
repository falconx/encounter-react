var React = require('react');
var _ = require('lodash');

var Marker = React.createClass({
	componentDidMount: function() {
		this.componentDidUpdate();
	},

	componentDidUpdate: function() {
		// Create or update marker
		if( this.state && this.state.marker ) {
			this.state.marker.setOptions( this.props );
		} else {
			var marker = new google.maps.Marker( this.props );

			window.markers.push( marker );

			this.setState({ marker: marker });
		}
	},

	render: function() {
		return false;
	}
});

module.exports = Marker;