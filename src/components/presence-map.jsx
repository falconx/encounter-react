var React = require('react');
var addons = require('react/addons').addons;
var _ = require('lodash');

// Note this is an internal method that is not explicitly exposed by React
var flattenChildren = require('react/lib/flattenChildren');

var Modal = require('./modal');
// var ProfileMarker = require('../marker-profile');
var EncounterMapOverlay = require('../map-overlay');

var MapConfig = require('../constants/maps').defaults;

var PresenceActions = require('../actions/presence');

var PresenceMap = React.createClass({
  getDefaultProps: function() {
    return {
      mapOptions: {}, // Config to override MapConfig defaults
      center: { lat: 0, lng: 0 }, // LatLngLiteral converted to LatLng by google maps
      // presences: [], // Translate to markers
      bounds: undefined, // Optional LatLngBounds to restrict the map view
      showOverlay: false
      // showCurrentPosition: false // Show a marker at the users current position
    };
  },

  getInitialState: function() {
    return {
      map: null
      // currentMarker: null, // Marker to indicate users current position
      // showReleaseModal: false, // Release presence confirmation modal
      // showPickupModal: false // Pickup presence modal
    };
  },

  componentDidMount: function() {
    var self = this;
    var canvasEl = this.refs.map_encounter.getDOMNode();
    var map = new google.maps.Map(canvasEl, _.extend({}, MapConfig, this.props.mapOptions, { center: this.props.center }));
    var overlay = this.props.showOverlay ? new EncounterMapOverlay( map.getBounds(), MapConfig.overlayImage, map ) : null;

    // Initialise map
    google.maps.event.addListenerOnce(map, 'tilesloaded', function() {
      if( self.props.bounds ) {
        map.fitBounds( self.props.bounds );
      }

      self.setState({ map: map });

      // Menu item click handlers

      // self.refs.menu_item_release.getDOMNode().addEventListener('click', function() {
      //   self.setState({ showReleaseModal: true });
      // });

      // self.refs.menu_item_pickup.getDOMNode().addEventListener('click', function() {
      //   self.setState({ showPickupModal: true });
      // });

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

  // Todo:
  // This assumes that props.presences is ordered by closest - possibly not a safe assertion. We could move this logic
  // over to the server?
  // getClosest: function() {
  //   var self = this;
  //   var closest = null; 

  //   // The closest marker to our position will be the first one returned from our original query which the user has not
  //   // already found
  //   if( this.props.presences.length ) {
  //     var matches = _.filter(this.props.presences, function( presence ) {
  //       return !_.findWhere(self.props.account.found, { _id: presence._id });
  //     });

  //     if( matches && matches.length ) {
  //       closest = matches[0];
  //     }
  //   }

  //   return closest;
  // },

  // handlePickupModalClose: function() {
  //   this.state.infobox.close();
  //   this.setState({ showPickupModal: false });
  // },

  // handlePickupModalPickup: function() {
  //   var closest = this.getClosest();

  //   if( closest ) {
  //     PresenceActions.pickupPresence( closest._id );
  //   }

  //   this.handlePickupModalClose();
  // },

  // handleReleaseModalClose: function() {
  //   this.state.infobox.close();
  //   this.setState({ showReleaseModal: false });
  // },

  // handleReleaseModalYes: function() {
  //   PresenceActions.dropPresence({
  //     location: [ this.props.center.lng, this.props.center.lat ],
  //     uid: this.props.account._id
  //   });

  //   this.handleReleaseModalClose();
  // },

  renderChildren: function() {
    var self = this;
    var children = [];
    var flattened = flattenChildren(this.props.children);
    var index = 0;

    _.each(flattened, function( child ) {
      children.push(addons.cloneWithProps(child, {
        key: index++,
        map: self.state.map
      }));
    });

    return children;
  },

  render: function() {
    // The closest marker to our position will be the first one returned from our original query
    // var closest = this.getClosest();

    // if( closest ) {
    //   var accountPhotoStyle = {
    //     backgroundImage: 'url(' + closest.uid.photo + ')'
    //   };
    // }

    return (
      <div>
        <div className="map" ref="map_encounter" />
        {this.renderChildren()}
      </div>
    );

    // <Modal show={this.state.showReleaseModal}>
    //   <p>Are you sure you'd like to drop a presence?</p>
    //   <p>
    //     <button onClick={this.handleReleaseModalYes}>Yes</button>
    //     <button onClick={this.handleReleaseModalClose}>No</button>
    //   </p>
    // </Modal>

    // <Modal show={closest && this.state.showPickupModal} closeHandler={this.handlePickupModalClose}>
    //   <p>You have encountered a presence!</p>
    //   <p>
    //     <div style={accountPhotoStyle} className="account-photo"></div>
    //   </p>
    //   <p>
    //     <button onClick={this.handlePickupModalPickup}>Pickup</button>
    //   </p>
    // </Modal>
  }
});

module.exports = PresenceMap;