var React = require('react');

var _ = require('lodash');

var socket = io.connect();

var mapConfig = require('../constants/maps').encounterMap;

var EncounterMapOverlay = require('../map-overlay');

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');

var MapEncounter = React.createClass({
  mixins: [PresenceStore.mixin],

  getDefaultProps: function() {
    return {
      mapOptions: mapConfig.options
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
      PresenceActions.dropPresence({
        location: [e.latLng.lat(), e.latLng.lng()]
      });

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
      console.log(self.props.account.dropped, 'tilesloaded');

      overlay.draw();

      // Populate map with presence data
      _.each(self.props.account.dropped, function( presence ) {
        new google.maps.Marker({
              position: new google.maps.LatLng( presence.location[0], presence.location[1] ),
              map: map
            });
      });
    });

    socket.on('presence:dropped', function( data ) {
      new google.maps.Marker({
            position: new google.maps.LatLng( data.position.lat, data.position.lng ),
            map: map
          });
    });
  },

  storeDidChange: function() {
    console.log('PresenceStore storeDidChange');
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