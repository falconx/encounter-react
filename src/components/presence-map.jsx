var React = require('react');
var addons = require('react/addons').addons;
var _ = require('lodash');

// Note this is an internal method that is not explicitly exposed by React
var flattenChildren = require('react/lib/flattenChildren');

var Modal = require('./modal');
var EncounterMapOverlay = require('../map-overlay');

var MapConfig = require('../constants/maps').defaults;

var PresenceActions = require('../actions/presence');

var PresenceMap = React.createClass({
  getDefaultProps: function() {
    return {
      mapOptions: {}, // Config to override MapConfig defaults
      center: { lat: 0, lng: 0 }, // LatLngLiteral converted to LatLng by google maps
      bounds: undefined, // Optional LatLngBounds to restrict the map view
      showOverlay: false
    };
  },

  getInitialState: function() {
    return {
      map: null
    };
  },

  componentDidMount: function() {
    var self = this;
    var canvasEl = this.refs.map_encounter.getDOMNode();
    var map = new google.maps.Map(canvasEl, _.extend({}, MapConfig, this.props.mapOptions, { center: this.props.center }));
    var overlay = this.props.showOverlay ? new EncounterMapOverlay( map.getBounds(), MapConfig.overlayImage, map ) : null;

    // Since markers are generated lower in the component hierarchy, we store them as a global so we can access them here
    window.markers = [];

    // Initialise map
    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
      if( self.props.bounds ) {
        map.fitBounds( self.props.bounds );
      }

      self.setState({ map: map });

      // Draw fixed position overlay image
      if( overlay ) {
        overlay.draw();
      }

      self.forceUpdate();

      // Update overlay position when center changes
      google.maps.event.addListener(map, 'center_changed', function() {
        if( overlay ) {
          overlay.draw();
        }
      });
    });
  },

  shouldComponentUpdate: function() {
    return !!this.state.map;
  },

  componentDidUpdate: function( prevProps ) {
    // Re-center map
    this.state.map.setCenter( this.props.center );
  },

  componentWillUnmount: function() {
    this.state.map.set(null);
  },

  renderChildren: function() {
    var self = this;
    var children = [];
    var flattened = flattenChildren(this.props.children);
    var index = 0;

    // Clear all markers from the map
    _.each(window.markers, function( marker ) {
      marker.setMap(null);
    });

    _.each(flattened, function( child ) {
      children.push(addons.cloneWithProps(child, {
        key: index++,
        map: self.state.map
      }));
    });

    return children;
  },

  render: function() {
    return (
      <div>
        <div className="map" ref="map_encounter" />
        {this.renderChildren()}
      </div>
    );
  }
});

module.exports = PresenceMap;