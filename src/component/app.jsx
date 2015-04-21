var React = require('react');

var RouteHandler = require('react-router').RouteHandler;

var Login = require('./login');
var AccountStore = require('../store/account');

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
      <RouteHandler account={this.state.account} />
    );
  }
});

module.exports = App;