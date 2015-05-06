var express = require('express');
var app = express();

var path = require('path');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var mongoose = require('mongoose');

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
        // User record found
        done(null, user);
      } else {
        // Create new user record
        var newUser = new User({
              facebookId: profile.id,
              token: accessToken,
              name: profile.name.givenName + ' ' + profile.name.familyName
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

  res.redirect('/');
}

// Auth routes

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: facebookAuth.successURL,
    failureRedirect: facebookAuth.failureURL
  })
);

app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: facebookAuth.scope
  })
);

app.get('/auth/logout', isAuthenticated, function( req, res ) {
  req.logout();
  res.redirect('/');
});

app.get('/api/account', isAuthenticated, function( req, res ) {
  User
    .findOne({ _id: req.user._id })
    .populate('dropped found')
    .exec(function( err, presences ) {
      if( err ) {
        console.log(err);
      }

      res.send(presences);
    });
});

app.route('/api/presences/dropped', isAuthenticated)

  // Retrieve users dropped presences
  .get(function( req, res ) {
    Presence
      .find({ uid: req.user._id })
      .exec(function( err, presences ) {
        if( err ) {
          console.log(err);
        }

        res.send(presences);
      });
  })

  // Drop a presence
  .post(function( req, res ) {
    new Presence(req.body.presence)
      .save(function( err, presence ) {
        if( err ) {
          // Todo: Handle error
          console.log( err );
          next();
        }

        User.findOneAndUpdate(
          { _id : req.user._id },
          { $push: { dropped: presence } },
          { safe: true, upsert: true },
          function( err ) {
            if( err ) {
              console.log(err);
            }

            res.send(presence);
          }
        );
    });
  });

app.route('/api/presences/found', isAuthenticated)

  // Retrieve users found presences
  .get(function( req, res ) {
    User
      .find({ uid: req.user._id })
      .populate('found')
      .select('found')
      .exec(function( err, presences ) {
        if( err ) {
          console.log(err);
        }

        res.send(presences);
      });
  })

  // Add a presence to the user's found collection
  .post(function( req, res ) {
     new Presence(req.body.presence)
      .save(function( err, presence ) {
        if( err ) {
          // Todo: Handle error
          console.log( err );
          next();
        }

        User.findOneAndUpdate(
          { _id : req.user._id },
          { $push: { found: presence } },
          { safe: true, upsert: true },
          function( err ) {
            if( err ) {
              console.log(err);
            }

            res.send(presence);
          }
        );
    });
  });

// Retrieve all the presences found within the specified distance from the provided location
app.route('/api/presences/find/:lng/:lat/:distance/:userId', isAuthenticated)
  .get(function( req, res ) {
    Presence.findWithinRadius(req.params, function( err, presences ) {
      if( err ) {
        console.log(err);
      }

      res.send(presences);
    });
  });

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
  // Presence dropped
  socket.on('presence:dropped', function( data ) {
      io.sockets.emit('presence:dropped', data);
  });

  // Presence expired
  socket.on('presence:expired', function( data ) {
      io.sockets.emit('presence:expired', data);
  });
});