var React = require('react');

var _ = require('lodash');

var socket = io.connect();

var MapConfig = require('../constants/maps').encounterMap;
var EncounterMapOverlay = require('../map-overlay');

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');

var ObjectId = require('mongoose').Schema.Types.ObjectId;

var MapEncounter = React.createClass({
  getDefaultProps: function() {
    return {
      mapOptions: MapConfig.options
    };
  },

  componentDidMount: function() {
    var self = this;

    var el = this.refs.map_encounter.getDOMNode();

    // Todo: Get coordinates from user's current position

    var map = new google.maps.Map(el, _.extend(this.props.mapOptions, {
          center: new google.maps.LatLng( 43.6425569, -79.4073126 )
        }));

    var overlay = new EncounterMapOverlay( map.getBounds(), MapConfig.overlayImage, map );

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

      // Populate map with presence data
      _.each(self.props.account.dropped, function( presence ) {
        new google.maps.Marker({
              position: new google.maps.LatLng( presence.location[1], presence.location[0] ),
              map: map,
              id: presence._id,
              uid: presence.uid
            });
      });
    });

    socket.on('presence:dropped', function( data ) {
      // Todo: Only add if it does not belong to the current user

      if( data.uid !== self.props.account._id ) {
        new google.maps.Marker({
              position: new google.maps.LatLng( data.position.lat, data.position.lng ),
              map: map,
              id: data.id, // Attach Presence._id
              uid: data.uid // Attach User._id to determine who dropped it
            });
      }
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