var React = require('react');
var _ = require('lodash');

var Marker = React.createClass({
	componentDidMount: function() {
		this.componentDidUpdate();
	},

	componentDidUpdate: function() {
		var options = _.extend({}, this.props);

		// Create or update marker
		if( this.state && this.state.marker ) {
			this.state.marker.setOptions( options );
		} else {
			var marker = new google.maps.Marker( options );

			window.markers.push( marker );

			this.setState({ marker: marker });
		}
	},

	render: function() {
		return false;
	}
});

module.exports = Marker;