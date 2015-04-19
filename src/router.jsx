var React = require('react');
var Router = require('react-router');

var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var App = require('./component/app');
var Profile = require('./component/profile');

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={Profile} />
    <NotFoundRoute handler={Profile} />
  </Route>
);

module.exports = {
  run: function( el ) {
    Router.run(routes, function( Handler, state ) {
      React.render(<Handler params={state.params} />, el);
    });
  }
};