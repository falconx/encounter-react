var React = require('react');
var _ = require('lodash');

var Modal = require('./modal');
var ProfileMarker = require('../marker-profile');
var EncounterMapOverlay = require('../map-overlay');

var MapConfig = require('../constants/maps').defaults;

var PresenceActions = require('../actions/presence');

var PresenceMap = React.createClass({
  getDefaultProps: function() {
    return {
      mapConfig: {}, // Config to override MapConfig defaults
      center: { lat: 0, lng: 0 }, // LatLngLiteral converted to LatLng by google maps
      presences: [], // Translate to markers
      bounds: undefined, // Optional LatLngBounds to restrict the map view
      showOverlay: false,
      showCurrentPosition: false // Show a marker at the users current position
    };
  },

  getInitialState: function() {
    return {
      map: null,
      currentMarker: null, // Marker to indicate users current position
      markers: [], // The map markers converted from presence data
      circle: null, // Visually indicates search radius
      showReleaseModal: false // Release presence confirmation modal
    };
  },

  componentDidMount: function() {
    var self = this;
    var canvasEl = this.refs.map_encounter.getDOMNode();
    var map = new google.maps.Map(canvasEl, _.extend({}, MapConfig, this.props.mapConfig, { center: this.props.center }));
    var overlay = this.props.showOverlay ? new EncounterMapOverlay( map.getBounds(), MapConfig.overlayImage, map ) : null;

    // Initialise map
    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
      var circle = new google.maps.Circle({
        strokeWeight: 0,
        fillColor: '#ffffff',
        fillOpacity: 0.35,
        map: map,
        center: self.props.center,
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

      if( self.props.bounds ) {
        map.fitBounds( self.props.bounds );
      }

      self.setState({
        map: map,
        circle: circle,
        infobox: infobox
      });

      // Infobox release menu item click handler
      self.refs.menu_item_release.getDOMNode().addEventListener('click', function() {
        self.setState({ showReleaseModal: true });
      });

      // Draw fixed position overlay image
      if( overlay ) {
        overlay.draw();
      }

      // Populate map with presence data
      self.generateMarkers( self.props.presences );

      // Draw circle to indicate search radius
      self.drawSearchRadius();

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
    // Redraw search radius
    this.drawSearchRadius();

    // Re-center map
    this.state.map.setCenter( this.props.center );

    // Only generate markers if we have something different to show
    if( this.props.presences !== prevProps.presences ) {
      // Populate map with new presence data
      this.generateMarkers( this.props.presences );
    }
  },

  componentWillUnmount: function() {
    // Todo: Remove map listeners

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
    if( this.props.showCurrentPosition ) {
      var center = new google.maps.LatLng( this.props.center.lat, this.props.center.lng );

      marker = new ProfileMarker( this.state.map, center, this.props.account.photo );

      this.state.markers.push( marker );
    }

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
    this.state.circle.setRadius( this.props.searchRadius );
    this.state.circle.setCenter( this.props.center );
  },

  handleMenuItemFound: _.noop,

  handleMenuItemPickup: function() {
    // Todo: Show photo and message attached to presence

    // Todo: Get reference to nearest presence

    // PresenceActions.pickupPresence( presence.id );
  },

  handleReleaseModalClose: function() {
    this.setState({ showReleaseModal: false });
  },

  handleReleaseModalYes: function() {
    PresenceActions.dropPresence({
      location: [ this.props.center.lng, this.props.center.lat ],
      uid: this.props.account._id
    });

    this.state.infobox.close();

    this.handleReleaseModalClose();
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

        <Modal show={this.state.showReleaseModal} closeHandler={this.handleReleaseModalClose}>
          <p>Are you sure you'd like to drop a presence?</p>
          <button onClick={this.handleReleaseModalYes}>Yes</button>
          <button onClick={this.handleReleaseModalClose}>No</button>
        </Modal>

      </div>
    );
  }
});

module.exports = PresenceMap;