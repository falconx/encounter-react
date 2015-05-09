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
      showReleaseModal: false, // Release presence confirmation modal
      showPickupModal: false // Pickup presence modal
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

      // Menu item click handlers

      self.refs.menu_item_release.getDOMNode().addEventListener('click', function() {
        self.setState({ showReleaseModal: true });
      });

      self.refs.menu_item_pickup.getDOMNode().addEventListener('click', function() {
        self.setState({ showPickupModal: true });
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
      var position = new google.maps.LatLng( presence.location[1], presence.location[0] );

      // Show account photo as marker icon if the presence has already been found
      if( _.findWhere(self.props.account.found, { _id: presence._id }) ) {
        marker = new ProfileMarker( self.state.map, position, presence.uid.photo );
      } else {
        marker = new google.maps.Marker({
          icon: MapConfig.hotspotImage,
          position: position,
          map: self.state.map,
          id: presence._id,
          uid: presence.uid
        });
      }

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

  handlePickupModalClose: function() {
    this.state.infobox.close();
    this.setState({ showPickupModal: false });

    // Todo: Redraw to show found marker icon as the user's account photo
  },

  handlePickupModalPickup: function() {
    // The closest marker to our position will be the first one returned from our original query
    var closest = this.props.presences.length ? this.props.presences[0] : null;

    if( closest ) {
      PresenceActions.pickupPresence( closest._id );
    }

    this.handlePickupModalClose();
  },

  handleReleaseModalClose: function() {
    this.state.infobox.close();
    this.setState({ showReleaseModal: false });
  },

  handleReleaseModalYes: function() {
    PresenceActions.dropPresence({
      location: [ this.props.center.lng, this.props.center.lat ],
      uid: this.props.account._id
    });

    this.handleReleaseModalClose();
  },

  render: function() {
    // The closest marker to our position will be the first one returned from our original query
    var closest = this.props.presences.length ? this.props.presences[0] : null;

    if( closest ) {
      var accountPhotoStyle = {
        backgroundImage: 'url(' + closest.uid.photo + ')'
      };
    }

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

        <Modal show={this.state.showReleaseModal}>
          <p>Are you sure you'd like to drop a presence?</p>
          <p>
            <button onClick={this.handleReleaseModalYes}>Yes</button>
            <button onClick={this.handleReleaseModalClose}>No</button>
          </p>
        </Modal>

        {closest &&
          <Modal show={this.state.showPickupModal} closeHandler={this.handlePickupModalClose}>
            <p>You have encountered a presence!</p>
            <p>
              <div style={accountPhotoStyle} className="account-photo"></div>
            </p>
            <p>
              <button onClick={this.handlePickupModalPickup}>Pickup</button>
            </p>
          </Modal>
        }

      </div>
    );
  }
});

module.exports = PresenceMap;