var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  render: function() {
    return (
      <RouteHandler />
    );
  }
});

module.exports = App;