var React = require('react');
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var App = require('./component/app');
var Dashboard = require('./component/dashboard');

var AccountActions = require('./action/account');

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={Dashboard} />
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