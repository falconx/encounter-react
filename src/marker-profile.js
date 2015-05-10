/**
 * Special case Google Map Marker to show profile image and attach a class name
 */
function ProfileMarker( map, position, profileImage, classes ) {
  this.position_ = position;
  this.profileImage_ = profileImage;

  this.classes_ = ['marker-profile'];
  Array.prototype.push.apply(this.classes_, classes);

  // Once the LatLng and text are set, add the overlay to the map. This will trigger a call to panes_changed which
  // should in turn call draw.
  this.setMap( map );
}

ProfileMarker.prototype = new google.maps.OverlayView();

ProfileMarker.prototype.draw = function() {
  var self = this;
  var img;

  // Check if the div has been created
  var div = this.div_;

  if( !div ) {
    // Create a overlay text DIV
    div = this.div_ = document.createElement('DIV');

    // Create the DIV representing our ProfileMarker
    div.style.border = 'none';
    div.style.position = 'absolute';
    div.style.paddingLeft = '0px';
    div.style.cursor = 'pointer';
    div.style.backgroundImage = 'url(' + this.profileImage_ + ')';
    div.className = this.classes_.join(' ');

    google.maps.event.addDomListener(div, 'click', function() {
      google.maps.event.trigger(self, 'click');
    });

    // Then add the overlay to the DOM
    var panes = this.getPanes();
    panes.overlayImage.appendChild( div );
  }

  // Position the overlay 
  var point = this.getProjection().fromLatLngToDivPixel( this.position_ );

  if( point ) {
    div.style.left = point.x + 'px';
    div.style.top = point.y + 'px';
  }
};

ProfileMarker.prototype.remove = function() {
  // Check if the overlay was on the map and needs to be removed
  if( this.div_ ) {
    this.div_.parentNode.removeChild( this.div_ );
    this.div_ = null;
  }
};

ProfileMarker.prototype.getPosition = function() {
  return this.position_;
};

module.exports = ProfileMarker;