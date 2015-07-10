var React = require('react');
var Navigation = require('react-router').Navigation;
var Link = require('react-router').Link;

var Modal = require('./modal');
var MessageActions = require('../actions/message');
var MessageStore = require('../stores/message');

var Messages = React.createClass({
  mixins: [Navigation, MessageStore.mixin],

  // Todo: Would this be more appropritate in a Mixin?
  statics: {
    dateFromObjectId: function( id, format ) {
      return moment(parseInt(id.toString().substring(0, 8), 16) * 1000).format(format || 'MMM D YYYY');
    }
  },

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
    if( this.state.encounters.length ) {
      return (
        <div className="message-directory">
          <ul>
            {this.state.encounters.map(function( encounter ) {
              var style = { backgroundImage: 'url(' + encounter.creator.photo + ')' };

              return (
                <li key={encounter._id}>
                  <Link to="message-thread" params={{ encounterId: encounter._id }}>
                    <div className="account-photo" style={style}></div>
                    <p>Released: {Messages.dateFromObjectId( encounter.presence._id )}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return (
      <Modal closeHandler={this.goBack}>
        <p>You've not yet encountered anyone or had any of your own presences encountered.</p>
      </Modal>
    );
  }
});

module.exports = Messages;