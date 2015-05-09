var defaults = {
  overlayImage: '/images/mapbg.png',
  hotspotImage: {
    url: '/images/maphotspot.png',
    anchor: new google.maps.Point(25, 25),
    origin: new google.maps.Point(0, 0),
    scaledSize: new google.maps.Size(50, 50)
  },
  accuracyThreshold: 250, // Meters
  searchRadius: 750, // Meters

  // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
  options: {
    zoom: 14,
    maxZoom: 14, // Ensures we don't zoom too much when fitting bounds around a singular marker
    scrollwheel: false,
    draggable: false,
    disableDoubleClickZoom: true,
    disableDefaultUI: true,
    styles: [
      {
        'stylers': [
          { 'hue': '#ff1a00' },
          { 'invert_lightness': true },
          { 'saturation': -100 },
          { 'lightness': 33 },
          { 'gamma': 0.5 }
        ]
      },
      {
        'featureType': 'water',
        'elementType': 'geometry',
        'stylers': [
          { 'color': '#2d333c' }
        ]
      },
      { // Turn off points of interest
        'featureType': 'poi',
        'elementType': 'labels',
        'stylers': [
          { 'visibility': 'off' }
        ]
      }
    ]
  }
};

module.exports = {
  defaults: defaults,
  encounter: defaults,
  released: defaults
};