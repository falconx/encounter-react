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

// Auth routes

app.use('/api', router);

router.route('/auth/facebook/callback').get(function() {
  console.log('auth facebook callback');
  passport.authenticate('facebook', {
    successRedirect: facebookAuth.successURL,
    failureRedirect: facebookAuth.failureURL
  });
});

router.route('/auth/facebook').get(function() {
  console.log('auth facebook');
  passport.authenticate('facebook', {
    scope: facebookAuth.scope
  });
});

router.route('/auth/logout').get(isAuthenticated, function( req, res ) {
  req.logout();
  res.redirect('/');
});

// Retrieve account
router.route('/account').get(isAuthenticated, function( req, res ) {
  fs.readFile(path.resolve(__dirname + '/../mocks/account.json'), 'utf8', function( error, data ) {
    res.send(data);
  });
});

// Retrieve all the presences found within the specified distance from the provided location
router.route('/presences/find/:lng/:lat/:distance').get(isAuthenticated, function( req, res ) {
  fs.readFile(path.resolve(__dirname + '/../mocks/find.json'), 'utf8', function( error, data ) {
    res.send(data);
  });
});

// router.route('/account').get(function( req, res, next ) {
//   User
//     .findOne({ _id: req.user._id })
//     .populate('released encountered')
//     .exec(function( err, presences ) {
//       if( err ) {
//         console.log(err);
//         next();
//       }

//       Presence.populate(presences, [
//         { path: 'released.uid', model: 'User', select: '_id photo' },
//         { path: 'encountered.uid', model: 'User', select: '_id photo' }
//       ], function( err, presences ) {
//         if( err ) {
//           console.log(err);
//           next();
//         }

//         res.send(presences);
//       });
//     });
// });

// router.route('/presences/released')

//   // Retrieve users released presences
//   .get(function( req, res, next ) {
//     Presence
//       .find({ uid: req.user._id })
//       .exec(function( err, presences ) {
//         if( err ) {
//           console.log( err );
//           next();
//         }

//         res.send(presences);
//       });
//   })

//   // Drop a presence
//   .post(function( req, res, next ) {
//     // new Message({
//     //   uid: req.user._id,
//     //   message: req.body.presence.question
//     // }).save(function( err, message ) {

//       // Replace question with a reference to the message instance
//       // var presence = _.extend({}, req.body.presence, { mid: message._id });

//       new Presence(req.body.presence)
//         .save(function( err, presence ) {
//           if( err ) {
//             // Todo: Handle error
//             console.log( err );
//             next();
//           }

//           // Reference presence in users released presences collection
//           User.findOneAndUpdate(
//             { _id : req.user._id },
//             { $push: { released: presence } },
//             { safe: true, upsert: true },
//             function( err ) {
//               if( err ) {
//                 console.log( err );
//                 next();
//               }

//               res.send(presence);
//             }
//           );
//         });

//     // });
//   });

// router.route('/presences/encountered')

//   // Retrieve users encountered presences
//   // .get(function( req, res, next ) {
//   //   User
//   //     .findOne({ _id: req.user._id })
//   //     .populate('encountered')
//   //     .select('encountered')
//   //     .exec(function( err, presences ) {
//   //       if( err ) {
//   //         console.log( err );
//   //         next();
//   //       }

//   //       res.send(presences);
//   //     });
//   // })

//   // Add a presence to the user's encountered collection
//   .post(function( req, res, next ) {
//     Presence
//       .findOne({ _id: req.body.presenceId })
//       .exec(function( err, presence ) {
//         User.findOneAndUpdate(
//           { _id : req.user._id },
//           { $push: { encountered: presence } },
//           { safe: true, upsert: true },
//           function( err ) {
//             if( err ) {
//               console.log(err);
//               next();
//             }

//             res.send(presence);
//           }
//         );
//     });
//   });

// // Retrieve all the presences found within the specified distance from the provided location
// router.route('/presences/find/:lng/:lat/:distance')
//   .get(function( req, res, next ) {
//     var params = _.extend(req.params, { userId: req.user._id });

//     Presence.findWithinRadius(params, function( err, presences ) {
//       if( err ) {
//         console.log(err);
//         next();
//       }

//       res.send(presences);
//     });
//   });

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