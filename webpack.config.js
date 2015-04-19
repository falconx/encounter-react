var webpack = require('webpack');

module.exports = {
  cache: true,
  entry: [
    './src/app.js' // App entry point
  ],
  output: {
    path: __dirname + '/public/',
    publicPath: '/assets',
    filename: 'bundle.js'
  },
  module: {
  	loaders: [
  		{
  			test: /\.jsx$/,
  			loaders: [
          'jsx-loader?harmony'
        ],
  			exclude: /node_modules/
  		}
  	]
  },
  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};