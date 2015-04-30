var defaults = {
  overlayImage: '/images/mapbg.png',
  accuracyThreshold: 250, // Meters
  searchRadius: 750, // Meters
  options: {
    zoom: 14,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
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
      }
    ]
  }
};

var maps = {
  encounter: defaults
};

module.exports = maps;