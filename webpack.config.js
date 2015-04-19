var webpack = require('webpack');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server',
    './src/js/main.jsx' // App entry point
  ],
  output: {
    path: __dirname + '/src/',
    publicPath: '/assets',
    filename: 'bundle.js'
  },
  module: {
  	loaders: [
  		{
  			test: /\.jsx$/,
  			loaders: [
          'react-hot',
          'jsx-loader?harmony'
        ],
  			exclude: /node_modules/
  		}
  	]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};