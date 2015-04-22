var React = require('react');

var _ = require('lodash');

var socket = io.connect();

var mapConfig = require('../constants/maps').encounterMap;

var EncounterMapOverlay = require('../map-overlay');

// Connect to data store
// require('mongoose').connect('mongodb://localhost/encounter-react');

// Models
// var User = require('../../models/user');

var MapEncounter = React.createClass({
  getDefaultProps: function() {
    return {
      mapOptions: mapConfig.options
    };
  },

  getInitialState: function() {
    return {
      markers: []
    };
  },

  componentDidMount: function() {
    var self = this;

    var el = this.refs.map_encounter.getDOMNode();

    // Todo: Get coordinates from user's current position
    var map = new google.maps.Map(el, _.extend(this.props.mapOptions, {
          center: new google.maps.LatLng( 43.6425569, -79.4073126 )
        }));

    var overlay = new EncounterMapOverlay( map.getBounds(), mapConfig.overlayImage, map );

    google.maps.event.addListener(map, 'click', function( e ) {
      socket.emit('presence:dropped', {
        user: null,
        position: {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        }
      });
    });

    google.maps.event.addListener(map, 'center_changed', function() {
      overlay.draw();
    });

    // Todo: Hide map or overlay until this has triggered
    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
      overlay.draw();
    });

    socket.on('presence:dropped', function( data ) {
      var marker = new google.maps.Marker({
            position: new google.maps.LatLng( data.position.lat, data.position.lng ),
            map: map
          });

      // User.dropPresence( data.position.lat, data.position.lng );

      var newMarkers = self.state.markers;
      newMarkers.push( marker );

      self.setState({ markers: newMarkers });
    });
  },

  render: function() {
    return (
      <div>
        <p>Encounter Map</p>
        <div className="map" ref="map_encounter"></div>
      </div>
    );
  }
});

 module.exports = MapEncounter;