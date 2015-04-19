var React = require('react');

var Login = require('./login.jsx');

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

module.exports = Profile;