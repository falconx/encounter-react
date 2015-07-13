var React = require('react');
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var App = require('./components/app');
var Dashboard = require('./components/dashboard');
var MapEncounter = require('./components/map-encounter');
var MapReleased = require('./components/map-released');
var Messages = require('./components/messages');
var MessageThread = require('./components/message-thread');

var AccountActions = require('./actions/account');

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute name="dashboard" handler={Dashboard} />
    <Route name="map-encounter" path="encounter" handler={MapEncounter} />
    <Route name="map-released" path="released" handler={MapReleased} />
    <Route name="messages" path="messages" handler={Messages} />
    <Route name="message-thread" path="messages/:encounterId" handler={MessageThread} />
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