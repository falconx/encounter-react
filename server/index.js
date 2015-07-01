var express = require('express');
var app = express();
var router = express.Router();

var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var mongoose = require('mongoose');
var _ = require('lodash');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var facebookAuth = require('./config/providers.json').facebook;

// Transparently require() jsx
require('node-jsx').install({
  extension: '.jsx',
  harmony: true
});

// Models
var User = require('./models/user');
var Presence = require('./models/presence');
var Message = require('./models/message');
var Encounter = require('./models/encounter');

// Connect to data store
mongoose.connect('mongodb://localhost/encounter-react');

// App config
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', express.static(path.resolve(__dirname + '/../public')));
app.use('/images', express.static(path.resolve(__dirname + '/../public/images')));

// Todo: Remove once we bundle vendor files
app.use('/vendor', express.static(path.resolve(__dirname + '/../src/vendor')));

// Express session
app.use(session({ secret: 'secret-encounter' }));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

// Passport user serialisation
passport.serializeUser(function( user, done ) {
  done(null, user._id);
});

passport.deserializeUser(function( id, done ) {
  User.findOne({ _id: id }, function( err, user ) {
    done(err, user);
  });
});

// Passport strategies
passport.use(
  new FacebookStrategy({
    clientID: facebookAuth.clientID,
    clientSecret: facebookAuth.clientSecret,
    callbackURL: facebookAuth.callbackURL
  }, function( accessToken, refreshToken, profile, done ) {
    User.findOne({ facebookId : profile.id }, function( err, user ) {
      if( err ) {
        return done(err);
      }

      if( user ) {
        // Existing user record found
        done(null, user);
      } else {
        // Create new user record
        var newUser = new User({
          facebookId: profile.id,
          token: accessToken,
          name: profile.name.givenName + ' ' + profile.name.familyName,
          photo: 'http://graph.facebook.com/' + profile.id + '/picture?type=large'
        });

        newUser.save(function( err ) {
          return done(err, newUser);
        });
      }
    });
  })
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Routing

// Route middleware to ensure a user is logged in
function isAuthenticated( req, res, next ) {
  if( req.isAuthenticated() ) {
    return next();
  }

  res.sendStatus(403);
}

// Auth routes

app.use('/api', router);

// Login
router.route('/auth/facebook')
  .get(function( req, res, next ) {
    return passport.authenticate('facebook', {
      scope: facebookAuth.scope
    })(req, res, next);
  });

router.route('/auth/facebook/callback')
  .get(function( req, res, next ) {
    return passport.authenticate('facebook', {
      successRedirect: facebookAuth.successURL,
      failureRedirect: facebookAuth.failureURL
    })(req, res, next);
  });

// Logout
router.route('/auth/logout')
  .get(function( req, res ) {
    req.logout();
    res.redirect('/');
  });

// Retrieve account
router.route('/account').get(isAuthenticated, function( req, res ) {
  User.findOne({ '_id': req.user._id }).exec(function( err, user ) {
    // Add 'released' and 'encountered' presence collections
    Encounter.find({ 'creator': req.user._id }).exec(function( err, released ) {
      Encounter.find({ 'discoverer': req.user._id }).exec(function( err, encountered ) {
        _.extend(user, {
          'encountered': encountered,
          'released': released
        });

        res.send(user);
      });
    });
  });
});

// Retrieve all the presences found within the specified distance from the provided location
router.route('/presences/find/:lng/:lat/:distance').get(isAuthenticated, function( req, res ) {
  var params = _.extend(req.params, { userId: req.user._id });

  Presence.findWithinRadius(params, function( err, presences ) {
    res.send(presences);
  });
});

// Message directory
// Todo: Where released presences have been responded to
router.route('/encounters').get(isAuthenticated, function( req, res ) {
  Encounter.find({
    '$or': [
      { 'creator': req.user._id }, // Released
      { 'discoverer': req.user._id } // Encountered
    ]
  })
  .exec(function( err, encounters ) {
    res.send(encounters);
  });
});

// Retrieve message thread
router.route('/encounters/:id/messages').get(isAuthenticated, function( req, res ) {
  Encounter.findOne({ '_id': req.params.id }).exec(function( err, encounter ) {
    Message.find({
      '$and': [
        {
          '$or': [
            { 'from': encounter.creator },
            { 'from': encounter.discoverer }
          ]
        },
        { 'presence': encounter.presence }
      ]
    })
    .exec(function( err, messages ) {
      res.send(messages);
    });
  });
});

// Encounter presence
router.route('/encounters/:id').post(isAuthenticated, function( req, res ) {
  Presence.findOne({ '_id': req.body.presenceId }).exec(function( err, presence ) {
    var encounter = {
      'presence': presence._id,
      'creator': presence.user,
      'discoverer': req.user._id
    };

    new Encounter(encounter).save(function( err, encounter ) {
      res.send(encounter);
    });
  });
});

// Reply to message
router.route('/presences/:id/messages').post(isAuthenticated, function( req, res ) {
  Presence.findOne({ '_id': req.params.id }).exec(function( err, presence ) {
    var message = {
      'from': req.user._id,
      'presence': req.params.id,
      'message': req.body.message
    };

    new Message(message).save(function( err, message ) {
      res.send(message);
    });
  });
});

// Release presence
router.route('/presences').post(isAuthenticated, function( req, res ) {
  var presence = {
    'creator': req.user._id,
    'location': req.body.location
  };

  new Presence(presence).save(function( err, presence ) {
    res.send(presence);
  });
});

/*


MESSAGE
---------------
_id
from
presence


PRESENCE
---------------
_id
creator


USER
---------------
_id


ENCOUNTER
---------------
_id
presence
creator
discoverer


*/

/*

// Account
GET /api/account

// Encountered
encountered = select from ENCOUNTER where creator = req.user._id

// Released
released = select from ENCOUNTER where discoverer = req.user._id

// TODO: WHERE released have a response
// Message directory
GET /api/encounters
directory = encountered + released

// Retrieve message thread
GET /api/encounters/:id/messages
messages = select from MESSAGE where (ENCOUNTER.creator = MESSAGE.from OR ENCOUNTER.discoverer = MESSAGE.from) AND (ENCOUNTER.presence = MESSAGE.presence)

// Encounter presence
POST /api/encounters/:id

// Reply to message
POST /api/presences/:id/messages

// Release presence
POST /api/presences

// Find nearby presences
GET /presences/find/:lng/:lat/:distance

*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Start server

app.start = function() {
  return app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
  });
};

var server = app.start();

// Socket.IO

var io = require('socket.io').listen(server);

io.sockets.on('connection', function( socket ) {
  // Presence released
  socket.on('presence:release', function( data ) {
    io.sockets.emit('presence:release', data);
  });

  // Presence expired
  socket.on('presence:expired', function( data ) {
    io.sockets.emit('presence:expired', data);
  });

  // Message sent
  socket.on('message:sent', function( data ) {
    io.sockets.emit('message:sent', data);
  })
});