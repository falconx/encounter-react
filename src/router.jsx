var React = require('react');
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var App = require('./components/app');
var Dashboard = require('./components/dashboard');
var MapEncounter = require('./components/map-encounter');

var AccountActions = require('./actions/account');

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="dashboard" handler={Dashboard} />
    <Route name="map-encounter" path="encounter" handler={MapEncounter} />
    <NotFoundRoute handler={Dashboard} />
  </Route>
);

module.exports = {
  run: function( el ) {
		AccountActions.loadAccount();
		
    Router.run(routes, function( Handler, state ) {
      React.render(<Handler params={state.params} />, el);
    });
  }
};