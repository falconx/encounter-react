var webpack = require('webpack');
var path = require('path');

module.exports = {
  cache: true,
  context: path.join(__dirname, 'src'),
  entry: './app.js',
  module: {
  	loaders: [
  		{
        test: /\.jsx$/,
        loader: 'jsx-loader?harmony'
      },
  	]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
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