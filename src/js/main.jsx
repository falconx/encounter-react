var Router = ReactRouter;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var Flux = new McFly();

// Components

var Login = React.createClass({
  render: function() {
    return (
      <a href="/auth/facebook">Login with facebook</a>
    );
  }
});

var Profile = React.createClass({
  getInitialState: function() {
    return {
      profile: null
    };
  },

  componentDidMount: function() {
    var self = this;

    // Obtain profile data if user is logged in
    $.getJSON('/auth/account', function( response ) {
      if( !response ) {
        return;
      }

      self.setState({ profile: response });
    });
  },

  render: function() {
    if( !this.state.profile ) {
      return <Login />;
    }

    return (
      <p>Hi {this.state.profile.name} <a href="/auth/logout">Logout</a></p>
    );
  }
});

var App = React.createClass({
  render: function() {
    return (
      <RouteHandler />
    );
  }
});

// Routing

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={Profile} />
    <NotFoundRoute handler={Profile} />
  </Route>
);

Router.run(routes, function( Handler ) {
  React.render(<Handler />, document.getElementById('encounter'));
});