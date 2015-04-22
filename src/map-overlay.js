function EncounterMapOverlay( bounds, image, map ) {
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;

  this.div_ = null;

  this.setMap( map );
}

EncounterMapOverlay.prototype = new google.maps.OverlayView();

EncounterMapOverlay.prototype.draw = function() {
  var overlayProjection = this.getProjection();

  if( overlayProjection ) {
    var mapBounds = this.map.getBounds();
    var ne = overlayProjection.fromLatLngToDivPixel( mapBounds.getNorthEast() );
    var sw = overlayProjection.fromLatLngToDivPixel( mapBounds.getSouthWest() );

    var div = this.div_;
    var img = this.img_;

    if( div ) {
      div.style.left = sw.x + 'px';
      div.style.width = (ne.x - sw.x) + 'px';
      div.style.height = (sw.y - ne.y) + 'px';

      // Ensure overlay is centered by calculating the image and canvas height offset
      div.style.top = ne.y -(( img.height - parseInt(div.style.height) ) / 2) + 'px';
    }
  }
};

// onAdd is called when the map's panes are ready and the overlay has been added to the map
EncounterMapOverlay.prototype.onAdd = function() {
  var div = document.createElement('div');
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';

  // Create the img element and attach it to the div.
  var img = document.createElement('img');
  img.src = this.image_;
  img.style.width = '100%';
  img.style.position = 'relative';
  div.appendChild( img );

  this.div_ = div;
  this.img_ = img;

  var panes = this.getPanes();
  panes.overlayLayer.appendChild( div );
};

module.exports = EncounterMapOverlay;