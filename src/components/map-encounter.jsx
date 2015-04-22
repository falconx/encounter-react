var React = require('react');

var socket = io.connect();

var MapEncounter = React.createClass({
  getDefaultProps: function() {
    return {
      lat: 43.6425569,
      lng: -79.4073126,
      zoom: 8
    };
  },

  componentDidMount: function() {
    var el = this.refs.map_encounter.getDOMNode();

    var map = new google.maps.Map(el, {
          center: new google.maps.LatLng( this.props.lat, this.props.lng ),
          zoom: this.props.zoom
        });

    var marker = new google.maps.Marker({
          position: new google.maps.LatLng( this.props.lat, this.props.lng ),
          map: map
        });

    google.maps.event.addListener(map, 'click', function( e ) {
      var [lat, lng] = [ e.latLng.lat(), e.latLng.lng() ];

      socket.emit('presence:dropped', {
        user: null,
        position: { lat: lat, lng: lng }
      });
    });

    socket.on('presence:dropped', function( data ) {
      new google.maps.Marker({
            position: new google.maps.LatLng( data.position.lat, data.position.lng ),
            map: map
          });
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