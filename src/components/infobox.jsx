var React = require('react');

var InfoBox = React.createClass({
	// getDefaultProps: function() { ... },

	componentDidMount: function() {
		this.componentDidUpdate();
	},

	componentDidUpdate: function() {
		var content = React.renderToStaticMarkup( this.props.children );

		// Create or update infobox
		if( this.state && this.state.infobox ) {
			this.state.infobox.setOptions( this.props );
			this.state.infobox.setContent( content );
		} else if( this.props.map ) {
			var infobox = new window.InfoBox( this.props );

			infobox.setContent( content );
			this.setState({ infobox: infobox });
		}
	},

	render: function() {
		if (!( this.props.map && this.state && this.state.infobox )) {
			return false;
		}

		if( this.props.visible ) {
			// Create a dummy marker with our position so infobox can be correctly positioned
			var anchor = new google.maps.Marker({ position: this.props.center });
			this.state.infobox.open( this.props.map, anchor );
		} else {
			this.state.infobox.close();
		}

		return false;
	}
});

module.exports = InfoBox;