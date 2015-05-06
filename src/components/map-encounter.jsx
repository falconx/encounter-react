var React = require('react');
var update = require('react/addons').addons.update;
var _ = require('lodash');

var socket = io.connect();

var MapConfig = require('../constants/maps').encounter; // Encounter map config
var EncounterMapOverlay = require('../map-overlay');

var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');

// Todo: Updating on socket listeners will happen too frequently in the real world

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
      currentMarker: null, // Marker to indicate users current position
      markers: [], // The map markers converted from presence data
      circle: null // Visually indicates search radius
    };
  },

  componentDidMount: function() {
    var self = this;
    var canvasEl = this.refs.map_encounter.getDOMNode();
    var map = new google.maps.Map(canvasEl, _.extend({}, MapConfig.options, { center: this.props.center }));
    var overlay = new EncounterMapOverlay( map.getBounds(), MapConfig.overlayImage, map );

    // Initialise map
    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
      var circle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#ffffff',
            fillOpacity: 0.35,
            map: map,
            center: new google.maps.LatLng( self.props.center.lat, self.props.center.lng ),
            radius: self.props.searchRadius
          });

      var infobox = new InfoBox({
            content: self.refs.infobox_menu.getDOMNode(),
            disableAutoPan: false,
            pixelOffset: new google.maps.Size(-111, -111),
            zIndex: null,
            closeBoxMargin: '93px 88px 0 0',
            closeBoxURL: '/images/mapmenu-close.png',
            infoBoxClearance: new google.maps.Size(1, 1)
          });

      self.setState({
        map: map,
        circle: circle,
        infobox: infobox
      });

      // Infobox release menu item click handler
      self.refs.menu_item_release.getDOMNode().addEventListener('click', self.handleMenuItemRelease);

      // Draw fixed position overlay image
      overlay.draw();

      // Populate map with presence data
      self.generateMarkers( self.props.presences );

      // Draw circle to indicate search radius
      self.drawSearchRadius();

      // Update overlay position when center changes
      google.maps.event.addListener(map, 'center_changed', function() {
        overlay.draw();
      });
    });
  },

  shouldComponentUpdate: function( nextProps, nextState ) {
    return !!this.state.map;
  },

  componentDidUpdate: function( prevProps ) {
    var center = new google.maps.LatLng( this.props.center.lat, this.props.center.lng );

    // Redraw search radius
    this.drawSearchRadius();

    // Re-center map
    this.state.map.setCenter(center);

    // Only generate markers if we have something different to show
    if( this.props.presences !== prevProps.presences ) {
      // Populate map with new presence data
      this.generateMarkers( this.props.presences );
    }
  },

  componentWillUnmount: function() {
    // Todo: Remove map bindings

    _.each(this.state.markers, function( marker ) {
      marker.setMap(null);
    });

    this.state.map.set(null);
  },

  /**
   * Generates map markers from a collection of presences
   */
  generateMarkers: function( presences ) {
    var self = this;
    var marker;

    // Remove existing markers
    _.each(this.state.markers, function( marker ) {
      marker.setMap(null);
    });

    // Generate new markers
    _.each(presences, function( presence ) {
      marker = new google.maps.Marker({
        icon: MapConfig.hotspotImage,
        position: new google.maps.LatLng( presence.location[1], presence.location[0] ),
        map: self.state.map,
        id: presence._id,
        uid: presence.uid
      });

      self.state.markers.push( marker );
    });

    // Add marker representing the position of the user
    // Adding the user marker last will ensure it will be on top of any other markers and can therefore be clicked on
    marker = new google.maps.Marker({
      icon: MapConfig.hotspotImage,
      position: new google.maps.LatLng( this.props.center.lat, this.props.center.lng ),
      map: this.state.map
    });

    this.state.markers.push( marker );

    // Toggle infobox menu overlay display by clicking on current position marker
    google.maps.event.addListener(marker, 'click', function() {
      if( self.state.infobox.getVisible() ) {
        self.state.infobox.close();
      } else {
        self.state.infobox.open( self.state.map, self.state.currentMarker );
      }
    });

    this.setState({ currentMarker: marker });
  },

  drawSearchRadius: function() {
    var center = new google.maps.LatLng( this.props.center.lat, this.props.center.lng );

    this.state.circle.setRadius(this.props.searchRadius);
    this.state.circle.setCenter(center);
  },

  handleMenuItemFound: _.noop,

  handleMenuItemPickup: _.noop,

  handleMenuItemRelease: function() {
    console.log('handleRelease');

    PresenceActions.dropPresence({
      location: [ this.props.center.lng, this.props.center.lat ],
      uid: this.props.account._id
    });

    // Todo: Show confirmation screen

    this.state.infobox.close();
  },

  render: function() {
    return (
      <div>
        <div className="map" ref="map_encounter"></div>
        <div id="infobox-menu-wrapper">
          <div id="infobox-menu" ref="infobox_menu">
            <a href="javascript:;" className="menu-item menu-item-found" ref="menu_item_found">
              <img src="/images/mapmenuicon-1.png" />
            </a>
            <a href="javascript:;" className="menu-item menu-item-pickup" ref="menu_item_pickup">
              <img src="/images/mapmenuicon-2.png" />
            </a>
            <a href="javascript:;" className="menu-item menu-item-release" ref="menu_item_release">
              <img src="/images/mapmenuicon-3.png" />
            </a>
          </div>
        </div>
      </div>
    );
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var MapEncounter = React.createClass({
  mixins: [PresenceStore.mixin],

  getInitialState: function() {
    return {
      nearbyPresences: [],
      userPosition: { lat: 0, lng: 0 },
      searchRadius: MapConfig.searchRadius
    };
  },

  findNearbyPresences: function() {
    // Retrieve surrounding presences
    PresenceActions.findWithinRadius(
      this.state.userPosition.lng,
      this.state.userPosition.lat,
      this.state.searchRadius,
      this.props.account._id
    );
  },

  componentDidMount: function() {
    var self = this;

    this.findNearbyPresences();

    // Find current geolocation
    (function() {

      function success( position ) {
        console.log({ lat: position.coords.latitude, lng: position.coords.longitude }, 'position found');

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
        self.setState({
          geolocationWatchId: navigator.geolocation.watchPosition(success, _.noop, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        });
      }

    })();

    // Update preference references if we find one has been dropped nearby
    socket.on('presence:dropped', function() {
      self.findNearbyPresences();
    });
  },

  componentWillUnmount: function() {
    // Clear geolocation watcher so we can recalculate our position when the component is next mounted
    if( this.state.geolocationWatchId ) {
      navigator.geolocation.clearWatch(this.state.geolocationWatchId);
    }
  },

  storeDidChange: function() {
    this.setState({
      nearbyPresences: PresenceStore.getNearbyPresences()
    });
  },

  handleRadiusChange: function() {
    this.setState({
      searchRadius: parseInt(this.refs.radius.getDOMNode().value) || MapConfig.searchRadius
    }, this.findNearbyPresences);
  },

  render: function() {
    return (
      <div>
        <PresenceMap
          center={this.state.userPosition}
          presences={this.state.nearbyPresences}
          searchRadius={this.state.searchRadius}
          {...this.props} />

        <p>
          <input type="number" ref="radius" />
          <button type="submit" onClick={this.handleRadiusChange}>Update Radius</button>
        </p>

      </div>
    );
  }
});

 module.exports = MapEncounter;