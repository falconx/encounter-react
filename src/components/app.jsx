var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var Login = require('./login');
var AccountStore = require('../stores/account');

var App = React.createClass({
	mixins: [AccountStore.mixin],

	getInitialState: function() {
    return {
      account: null
    };
  },

  storeDidChange: function() {
    this.setState({
      account: AccountStore.getAccount()
    });
  },

  render: function() {
    if( !this.state.account ) {
      return <Login />;
    }

    return (
      <div>
        <Link to="dashboard">Dashboard</Link>
        <RouteHandler account={this.state.account} />
      </div>
    );
  }
});

module.exports = App;