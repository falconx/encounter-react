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

// var routes = require('./routes/index')(passport);
// app.use('/', routes);

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
router.route('/account')
  .get(isAuthenticated, function( req, res, next ) {
    User
      .findOne({ _id: req.user._id })
      .populate('released encountered')
      .exec(function( err, presences ) {
        if( err ) { console.log(err); next(); } // Handle error

        Presence.populate(presences, [
          { path: 'encountered.user', model: 'User', select: '_id photo' }
        ], function( err, presences ) {
          if( err ) { console.log(err); next(); } // Handle error

          res.send(presences);
        });
      });
  });

// Retrieve all the presences found within the specified distance from the provided location
router.route('/presences/find/:lng/:lat/:distance')
  .get(isAuthenticated, function( req, res, next ) {
    var params = _.extend(req.params, { userId: req.user._id });

    Presence.findWithinRadius(params, function( err, presences ) {
      if( err ) { console.log(err); next(); } // Handle error

      res.send(presences);
    });
  });

// Release presence
router.route('/presences/release')
  .post(isAuthenticated, function( req, res, next ) {
    var message = {
      user: req.user._id,
      message: req.body.presence.question
    };

    // Create message thread with question
    new Message(message).save(function( err, message ) {
      if( err ) { console.log(err); next(); } // Handle error

      // Update presence with message
      var presence = _.extend({}, req.body.presence, {
        user: req.user._id,
        message: message._id
      });

      new Presence(presence).save(function( err, presence ) {
        if( err ) { console.log(err); next(); } // Handle error

        // Reference presence in users released presences collection
        User.findOneAndUpdate(
          { _id : req.user._id },
          { $push: { released: presence } },
          { safe: true, upsert: true },
          function( err ) {
            if( err ) { console.log(err); next(); } // Handle error

            res.send(presence);
          }
        );
      });
    });
  });

// Add a presence to the users encountered collection
router.route('/presences/:id/encounter')
  .post(function( req, res, next ) {
    // Todo: Validate distance from presence?

    Presence
      .findOne({ _id: req.params.id })
      .exec(function( err, presence ) {
        if( err ) { console.log(err); next(); } // Handle error

        User.findOneAndUpdate(
          { _id : req.user._id },
          { $push: { encountered: presence } },
          { safe: true, upsert: true, new: true },
          function( err ) {
            if( err ) { console.log(err); next(); } // Handle error

            if( req.body.response ) {
              var message = {
                user: req.user._id,
                presence: presence._id,
                message: req.body.response
              };

              new Message(message).save(function( err, message ) {
                if( err ) { console.log(err); next(); } // Handle error
              });
            }

            res.send(presence);
          }
        )
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