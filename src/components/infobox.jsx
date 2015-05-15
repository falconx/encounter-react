var React = require('react');
var _ = require('lodash');

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
		var options = _.omit(this.props, ['content']);

		if( this.props.content ) {
			_.extend(options, {
				content: this.props.content
			});
		}
 
		// Create or update infobox
		if( this.state && this.state.infobox ) {
			this.state.infobox.setOptions( options );
		} else if( this.props.map ) {
			var infobox = new window.InfoBox( options );

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
			// Don't call close as this will remove our content from the DOM - instead handle props.visible from a parent
			// component
			this.state.infobox.close();
		}
	},

	render: function() {
		return false;
	}
});

module.exports = InfoBox;