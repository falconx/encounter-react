var React = require('react');

var _ = require('lodash');

var socket = io.connect();

var MapConfig = require('../constants/maps').encounter; // Encounter map config
var EncounterMapOverlay = require('../map-overlay');

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var PresenceMap = React.createClass({
  getDefaultProps: function() {
    return {
      center: { lat: 0, lng: 0 },
      presences: [] // Translate to markers
    };
  },

  getInitialState: function() {
    return {
      map: null,
      markers: [], // The map markers converted from presence data
      circle: null // Indicates search radius
    };
  },

  componentDidMount: function() {
    var self = this;
    var canvasEl = this.refs.map_encounter.getDOMNode();
    var center = new google.maps.LatLng( this.props.center.lat, this.props.center.lng );
    var map = new google.maps.Map(canvasEl, _.extend({}, MapConfig.options, { center: center }));
    var overlay = new EncounterMapOverlay( map.getBounds(), MapConfig.overlayImage, map );

    // Initialise map
    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
      var circle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#ffffff',
            fillOpacity: 0.35,
            map: map,
            center: center,
            radius: MapConfig.searchRadius
          });

      overlay.draw();

      // Populate map with presence data
      self.generateMarkers( self.props.presences );

      // Draw circle to indicate search radius
      self.drawSearchRadius();

      // Pass click event through the circle layer
      google.maps.event.addListener(circle, 'click', function() {
        google.maps.event.trigger(map, 'click', arguments[0]);
      });

      // Update overlay position when center changes
      google.maps.event.addListener(map, 'center_changed', function() {
        overlay.draw();
      });

      self.setState({ map: map, circle: circle });
    });
  },

  // shouldComponentUpdate: function( nextProps, nextState ) { ... },

  componentDidUpdate: function( prevProps, prevState ) {
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////// Todo
    // Redraw search radius if we've moved
    // if( this.state.circle !== prevState.circle ) {
    //   this.drawSearchRadius();
    // }

    // Only generate markers if we have something different to show
    if( this.props.presences !== prevProps.presences ) {
      // Populate map with new presence data
      this.generateMarkers( this.props.presences );
    }
  },

  componentWillUnmount: function() {
    // Todo: Remove map bindings
  },

  /**
   * Generates map markers from a collection of presences
   */
  generateMarkers: function( presences ) {
    var self = this;
    var nextMarkers = [];

    // Remove existing markers
    _.each(this.state.markers, function( marker ) {
      marker.setMap(null);
    });

    // Generate new markers
    _.each(presences, function( presence ) {
      var marker = new google.maps.Marker({
            position: new google.maps.LatLng( presence.location[1], presence.location[0] ),
            map: self.state.map,
            id: presence._id,
            uid: presence.uid
          });

      nextMarkers.push( marker );
    });

    this.setState({ markers: nextMarkers });
  },

  drawSearchRadius: function() {
    // Todo: Better logic for updating an existing circle and avoiding duplication of definition

    // Todo: https://github.com/facebook/react/blob/0.11-stable/docs/docs/09.6-update.md
    // var _circle = _.clone(this.state.circle);
    // _circle.center = this.state.circle;
    // this.setState({ circle: _circle });

    this.setState({
      circle: new google.maps.Circle({
        strokeWeight: 0,
        fillColor: '#ffffff',
        fillOpacity: 0.35,
        map: this.state.map,
        center: this.state.center,
        radius: MapConfig.searchRadius
      })
    });
  },

  render: function() {
    return (
      <div className="map" ref="map_encounter"></div>
    );
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Todo: Investigate Leaflet

var MapEncounter = React.createClass({
  mixins: [PresenceStore.mixin],

  getInitialState: function() {
    return {
      nearbyPresences: [],
      userPosition: { lat: 43.6425569, lng: -79.4073126 }
    };
  },

  findNearbyPresences: function() {
    // Retrieve surrounding presences
    PresenceActions.findWithinRadius( this.state.userPosition.lng, this.state.userPosition.lat, MapConfig.searchRadius );
  },

  componentDidMount: function() {
    var self = this;

    this.findNearbyPresences();

    // Find current geolocation
    (function() {

      function error() {};

      function success( position ) {
        console.log(position.coords, 'position found');

        // If the found position is outside of our threshold, it's too inaccurate to show
        if( position.coords.accuracy <= MapConfig.accuracyThreshold ) {
          self.setState({
            userPosition: { lat: position.coords.latitude, lng: position.coords.longitude }
          });

          // Todo: Only perform an update if we have moved a specified distance from our last search to avoid hammering
          // the server
          self.findNearbyPresences();
        } else {
          // Todo: Handle location not found
          console.log('Position could not be determined');
        }
      }

      if( navigator.geolocation ) {
        navigator.geolocation.watchPosition(success, error, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }

    })();

    // Update preference references if we find one has been dropped nearby
    socket.on('presence:dropped', function( data ) {
      // Todo: Check if nearby before fetching all presence data
      self.findNearbyPresences();
    });
  },

  storeDidChange: function() {
    this.setState({
      nearbyPresences: PresenceStore.getNearbyPresences()
    });
  },  

  render: function() {
    return (
      <PresenceMap center={this.state.userPosition} presences={this.state.nearbyPresences} />
    );
  }
});

 module.exports = MapEncounter;