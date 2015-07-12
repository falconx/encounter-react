var React = require('react');
var Navigation = require('react-router').Navigation;
var Link = require('react-router').Link;

var Config = require('../config');

var Modal = require('./modal');
var MessageActions = require('../actions/message');
var MessageStore = require('../stores/message');
var HelpersMixin = require('../mixins/helpers');

var Messages = React.createClass({
  mixins: [Navigation, MessageStore.mixin, HelpersMixin],

  getInitialState: function() {
    return {
      encounters: []
    }
  },

  componentDidMount: function() {
    MessageActions.getEncounters();
  },

  storeDidChange: function() {
    this.setState({
      encounters: MessageStore.getEncounters()
    });
  },

  render: function() {
    var self = this;
    var style, progress, remaining, progressClassName;
    var lifespan = Config.presence.lifespan / 60; // Minutes

    if( this.state.encounters.length ) {
      return (
        <div className="message-directory">
          <ul>
            {this.state.encounters.map(function( encounter ) {
              style = { backgroundImage: 'url(' + encounter.creator.photo + ')' };
              progress = self.getTimeRemaining(encounter.presence, 'minutes') / lifespan * 100;
              remaining = Math.round((100 - progress) / 5) * 5; // Round to nearest 5
              progressClassName = 'progress-radial progress-' + remaining;

              return (
                <li key={encounter._id}>
                  <div className={progressClassName}>
                    <div className="overlay">
                      <Link to="message-thread" params={{ encounterId: encounter._id }}>
                        <span className="account-photo" style={style}></span>
                      </Link>
                    </div>
                  </div>
                  <ul>
                    <li>Released: {self.getDateReleased( encounter.presence )}</li>
                    <li>{self.getTimeRemaining(encounter.presence)} remaining</li>
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return (
      <Modal closeHandler={this.goBack}>
        <p>You've not yet encountered anyone or had any of your presences encountered.</p>
      </Modal>
    );
  }
});

module.exports = Messages;