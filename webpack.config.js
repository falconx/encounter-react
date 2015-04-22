var webpack = require('webpack');
var path = require('path');

module.exports = {
  cache: true,
  context: path.join(__dirname, 'src'),
  entry: './app.js',
  module: {
  	loaders: [
  		{
        test: /\.jsx$|node_modules\/react-googlemaps\/.*.js/,
        loader: 'jsx-loader?harmony',
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ],
    noParse: /\.min\.js/
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules'],
  },
  plugins: [
    new webpack.NoErrorsPlugin()

    // Optimize
    // new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin()
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  }
};