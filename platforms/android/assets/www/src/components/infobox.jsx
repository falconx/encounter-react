var React = require('react');

var InfoBox = React.createClass({
	getDefaultProps: function() {
		return {
			closeCallback: _.noop
		};
	},

	componentDidMount: function() {
		this.componentDidUpdate();
	},

	componentDidUpdate: function() {
		// Create or update infobox
		if( this.state && this.state.infobox ) {
			this.state.infobox.setOptions( this.props );
		} else if( this.props.map ) {
			var infobox = new window.InfoBox( this.props );

			google.maps.event.addListener(infobox, 'closeclick', this.props.closeCallback);

			this.setState({ infobox: infobox });
		}

		if( !(this.props.map && this.state && this.state.infobox) ) {
			return false;
		}

		if( this.props.visible ) {
			// Create a dummy marker with our position so infobox can be correctly positioned
			var anchor = new google.maps.Marker({ position: this.props.center });
			this.state.infobox.open( this.props.map, anchor );
		} else {
			this.state.infobox.close();
		}
	},

	render: function() {
		return false;
	}
});

module.exports = InfoBox;