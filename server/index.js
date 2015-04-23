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

// Express session
app.use(session({ secret: 'secret-encounter' }));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

// Passport user serialisation
passport.serializeUser(function( user, done ) {
  done(null, user.id);
});

passport.deserializeUser(function( id, done ) {
  User.findOne({ id: id }, function( err, user ) {
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
    User.findOne({ id : profile.id }, function( err, user ) {
      if( err ) {
        return done(err);
      }

      if( user ) {
        // User record found
        done(null, user);
      } else {
        // Create new user record
        var newUser = new User({
              id: profile.id,
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

// Route middleware to make sure a user is logged in
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
  res.send(req.user);
});

app.route('/api/presences/dropped', isAuthenticated)

  // Retrieve users dropped presences
  .get(function( req, res ) {
    res.send(req.user.droppedPresences || []);
  })

  // Drop a presence
  .post(function( req, res ) {
    if( req.body.presence ) {
      User.findOneAndUpdate(
        { id : req.user.id },
        { $push: { droppedPresences: new Presence(req.body.presence) } },
        { safe: true, upsert: true },
        function( err ) {
          console.log(err);
          // Todo: Bomb out! next();
        }
      );

      res.send(req.body.presence);
    } else {
      // Todo: Error
    }
  });

// Start server

app.start = function() {
  return app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
  });
};

var server = app.start();

// Socket.IO

var io = require('socket.io').listen( server );

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