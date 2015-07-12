var webpack = require('webpack');
var path = require('path');

module.exports = {
  cache: true,
  context: path.join(__dirname, 'src'),
  entry: {
    app: './app.js',
    vendors: [
      './vendors/infobox.js'
    ]
  },
  module: {
  	loaders: [
  		{ test: /\.jsx$/, loader: 'jsx-loader?harmony', },
      { test: /\.json$/, loader: 'json' },
      { test: /\.scss$/, loader: 'style!css!sass' }
    ],
    noParse: [
      /\.min\.js/
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules'],
  },
  plugins: [
    new webpack.NoErrorsPlugin(),

    // Split app and vendors
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js', Infinity),

    // Globals
    new webpack.ProvidePlugin({
      _: 'lodash',
      moment: 'moment'
      // InfoBox: 'InfoBox'
    })

    // Optimize
    // new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  }
};