var React = require('react');

var _ = require('lodash');

var socket = io.connect();

var MapConfig = require('../constants/maps').encounter; // Encounter map config
var EncounterMapOverlay = require('../map-overlay');

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');

var MapEncounter = React.createClass({
  mixins: [PresenceStore.mixin],

  getInitialState: function() {
    return {
      nearbyPresences: []
    };
  },

  componentDidMount: function() {
    var self = this;

    var el = this.refs.map_encounter.getDOMNode();

    // Todo: Get coordinates from user's current position
    var userLocation = { lat: 43.6425569, lng: -79.4073126 };

    var map = new google.maps.Map(el, _.extend({}, MapConfig.options, {
          center: new google.maps.LatLng( userLocation.lat, userLocation.lng )
        }));

    var overlay = new EncounterMapOverlay( map.getBounds(), MapConfig.overlayImage, map );

    // Retrieve surrounding presences
    PresenceActions.findWithinRadius( userLocation.lng, userLocation.lat, MapConfig.searchRadius );

    google.maps.event.addListener(map, 'click', function( data ) {
      // Drop presence at the users current location
      PresenceActions.dropPresence({
        uid: self.props.account._id,
        location: [data.latLng.lng(), data.latLng.lat()]
      });

      socket.emit('presence:dropped', {
        uid: self.props.account._id,
        position: {
          lat: data.latLng.lat(),
          lng: data.latLng.lng()
        }
      });

      // A presence has been found, add it to our list of found presences
      // PresenceActions.collectPresence( data.id );
    });

    google.maps.event.addListener(map, 'center_changed', function() {
      overlay.draw();
    });

    // Todo: Hide map or overlay until this has triggered

    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
      overlay.draw();

      // Todo: Populate with all presences that are not placed by ourself

      // Populate map with presence data
      // _.each(self.props.account.dropped, function( presence ) {
      _.each(self.state.nearbyPresences, function( presence ) {
        new google.maps.Marker({
              position: new google.maps.LatLng( presence.location[1], presence.location[0] ),
              map: map,
              id: presence._id,
              uid: presence.uid
            });
      });

      // Todo: Update circle position based on users location
      // Draw circle to indicate search radius
      var circle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#ffffff',
            fillOpacity: 0.35,
            map: map,
            center: new google.maps.LatLng( userLocation.lat, userLocation.lng ),
            radius: MapConfig.searchRadius
          });

      // Pass click event through the circle layer
      google.maps.event.addListener(circle, 'click', function() {
        google.maps.event.trigger(map, 'click', arguments[0]);
      });
    });

    socket.on('presence:dropped', function( data ) {
      // Todo: Only add if it does not belong to the current user

      // new google.maps.Marker({
      //       position: new google.maps.LatLng( data.position.lat, data.position.lng ),
      //       map: map,
      //       id: data.id, // Attach Presence._id
      //       uid: data.uid // Attach User._id to determine who dropped it
      //     });

      // Retrieve surrounding presences
      PresenceActions.findWithinRadius( userLocation.lng, userLocation.lat, MapConfig.searchRadius );
    });
  },

  storeDidChange: function() {
    this.setState({
      nearbyPresences: PresenceStore.getNearbyPresences()
    });

    // this.forceUpdate();
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