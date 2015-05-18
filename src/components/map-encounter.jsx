var React = require('react');
var _ = require('lodash');

var socket = io.connect();

var MapConfig = require('../constants/maps').encounter; // Encounter map config

var PresenceMap = require('./presence-map');
var PresenceActions = require('../actions/presence');
var PresenceStore = require('../stores/presence');
var Circle = require('./circle');
var Marker = require('./marker');
var MarkerProfile = require('./marker-profile');
var InfoBox = require('./infobox');
var Modal = require('./modal');

var MapEncounter = React.createClass({
  mixins: [PresenceStore.mixin],

  getInitialState: function() {
    return {
      nearbyPresences: [],
      userPosition: { lat: 0, lng: 0 },
      searchRadius: MapConfig.searchRadius,
      pickupRadius: MapConfig.pickupRadius,
      showMapMenu: false,
      showReleaseModal: false,
      showPickupModal: false
    };
  },

  findNearbyPresences: function() {
    // Retrieve surrounding presences
    PresenceActions.findWithinRadius( this.state.userPosition.lng, this.state.userPosition.lat, this.state.searchRadius );
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
        // Todo: Handle location not found
        self.setState({
          geolocationWatchId: navigator.geolocation.watchPosition(success, _.noop, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        });
      }

    })();

    // Handle menu item clicks

    $('body').on('click', '.menu-item-release', function( e ) {
      e.stopImmediatePropagation();
      self.setState({ showReleaseModal: true });
    });

    $('body').on('click', '.menu-item-pickup', function( e ) {
      e.stopImmediatePropagation();

      if( self.getClosest() ) {
        self.setState({ showPickupModal: true });
      }
    });

    // Update preference references if we find one has been dropped nearby
    socket.on('presence:dropped', function() {
      // Todo: This will happen too frequently in the real-world
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

  handleSearchRadiusChange: function() {
    this.setState({
      searchRadius: parseInt(this.refs.search_radius.getDOMNode().value) || MapConfig.searchRadius
    }, this.findNearbyPresences);
  },

  handlePickupRadiusChange: function() {
    this.setState({
      pickupRadius: parseInt(this.refs.pickup_radius.getDOMNode().value) || MapConfig.pickupRadius
    });
  },

  handleMarkerProfileClick: function() {
    this.setState({ showMapMenu: !this.state.showMapMenu });
  },

  handleMenuItemRelease: function() {
    this.setState({ showReleaseModal: true });
  },

  handleMenuItemPickup: function() {
    this.setState({ showPickupModal: true });
  },

  handlePickupModalClose: function() {
    this.setState({
      showPickupModal: false,
      showMapMenu: false
    });
  },

  handlePickupModalPickup: function() {
    var closest = this.getClosest();

    if( closest ) {
      PresenceActions.pickupPresence( closest._id );
    }

    this.handlePickupModalClose();
  },

  handleReleaseModalClose: function() {
    this.setState({
      showReleaseModal: false,
      showMapMenu: false
    });
  },

  handleReleaseModalYes: function() {
    PresenceActions.dropPresence({
      location: [ this.props.center.lng, this.props.center.lat ],
      uid: this.props.account._id
    });

    this.handleReleaseModalClose();
  },

  getInfoboxContent: function() {
    return '<div id="infobox-menu-wrapper"><div id="infobox-menu"><a href="javascript:;" class="menu-item menu-item-found"><img src="/images/mapmenuicon-1.png" /></a><a href="javascript:;" class="menu-item menu-item-pickup"><img src="/images/mapmenuicon-2.png" /></a><a href="javascript:;" class="menu-item menu-item-release"><img src="/images/mapmenuicon-3.png" /></a></div></div>';
  },

  // Todo:
  // This assumes that props.presences is ordered by closest - possibly not a safe assertion. We could move this logic
  // over to the server?
  getClosest: function() {
    var self = this;
    var closest = null; 

    // The closest marker to our position will be the first one returned from our original query which the user has not
    // already found
    if( this.state.nearbyPresences.length ) {
      var nearbyPresencesUsers = _.uniq(_.map(this.state.nearbyPresences, function( presence ) {
        return presence.uid._id;
      }));

      var matches = _.filter(this.state.nearbyPresences, function( presence ) {
        return !_.findWhere(self.props.account.found, { _id: presence._id }) &&
          presence.distance <= self.state.pickupRadius &&
          _.contains(nearbyPresencesUsers, presence.uid._id);
      });

      if( matches && matches.length ) {
        closest = matches[0];
      }
    }

    return closest;
  },

  renderMarkers: function() {
    var self = this;

    // Find all the user ids that have released presences nearby
    var nearbyPresencesUsers = _.uniq(_.map(this.state.nearbyPresences, function( presence ) {
      return presence.uid._id;
    }));

    return this.state.nearbyPresences.map(function( presence ) {
      var position = new google.maps.LatLng( presence.location[1], presence.location[0] );

      // Determine if the presence if the exact one found by the current user
      var found = _.findWhere(self.props.account.found, { _id: presence._id });

      // Hide all presences belonging to a user if we have already found one belong to them and this isn't the instance
      // they found
      var hide = false;

      if( !found ) {
        hide = _.contains(nearbyPresencesUsers, presence.uid._id);
      }

      if( found ) {
        return (
          <MarkerProfile
            key={presence._id}
            position={position}
            photo={presence.uid.photo}
            classes={['found']} />
        );
      } else if( !hide ) {
        return (
          <Marker
            key={presence._id}
            icon={MapConfig.hotspotImage}
            position={position}
            id={presence._id}
            uid={presence.uid} />
        );
      }
    });
  },

  render: function() {
    var userPosition = new google.maps.LatLng( this.state.userPosition.lat, this.state.userPosition.lng );
    var closest = this.getClosest();

    if( closest ) {
      var accountPhotoStyle = {
        backgroundImage: 'url(' + closest.uid.photo + ')'
      };
    }

    return (
      <div>
        <PresenceMap
          mapOptions={MapConfig.options}
          center={this.state.userPosition}
          showOverlay={true}
          {...this.props}>

          <Circle
            strokeWeight="0"
            fillColor="#ffffff"
            fillOpacity="0.2"
            center={this.state.userPosition}
            radius={this.state.searchRadius} />

          <Circle
            strokeWeight="0"
            fillColor="#ffffff"
            fillOpacity="0.4"
            center={this.state.userPosition}
            radius={this.state.pickupRadius} />

          {this.renderMarkers()}

          <MarkerProfile
            position={userPosition}
            photo={this.props.account.photo}
            clickHandler={this.handleMarkerProfileClick} />

          <InfoBox
            visible={this.state.showMapMenu}
            content={this.getInfoboxContent()}
            center={userPosition}
            disableAutoPan={false}
            pixelOffset={new google.maps.Size(-111, -111)}
            zIndex={null}
            closeBoxMargin="93px 88px 0 0"
            closeBoxURL="/images/mapmenu-close.png"
            closeCallback={this.handleMarkerProfileClick}
            infoBoxClearance={new google.maps.Size(1, 1)}
            enableEventPropagation={true} />

        </PresenceMap>

        <p>
          <input type="number" ref="search_radius" />
          <button type="submit" onClick={this.handleSearchRadiusChange}>Update search radius</button>
        </p>

        <p>
          <input type="number" ref="pickup_radius" />
          <button type="submit" onClick={this.handlePickupRadiusChange}>Update pickup radius</button>
        </p>

        <Modal show={this.state.showReleaseModal}>
          <p>Are you sure you'd like to drop a presence?</p>
          <p>
            <button onClick={this.handleReleaseModalYes}>Yes</button>
            <button onClick={this.handleReleaseModalClose}>No</button>
          </p>
        </Modal>

        <Modal show={this.state.showPickupModal} closeHandler={this.handlePickupModalClose}>
          <p>You have encountered a presence!</p>
          <p>
            <div style={accountPhotoStyle} className="account-photo"></div>
          </p>
          <p>
            <button onClick={this.handlePickupModalPickup}>Pickup</button>
          </p>
        </Modal>

      </div>
    );
  }
});

 module.exports = MapEncounter;