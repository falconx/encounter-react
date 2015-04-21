var React = require('react');

var Login = require('./login');

var Profile = React.createClass({
  render: function() {
    if( !this.props.account ) {
      return <Login />;
    }

    return (
      <p>Hi {this.props.account.name} <a href="/auth/logout">Logout</a></p>
    );
  }
});

module.exports = Profile;