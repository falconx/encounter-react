var express = require('express');
var app = express();
var router = express.Router();

var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var mongoose = require('mongoose');
var _ = require('lodash');
// var crontab = require('node-crontab');

var async = require('async');
var request = require('superagent');

// Allow superagent to proxy
require('superagent-proxy')(request);

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var facebookAuth = require('./config/providers.json').facebook;

// Transparently require() jsx
require('node-jsx').install({ extension: '.jsx', harmony: true });

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
          // photo: 'http://graph.facebook.com/' + profile.id + '/picture?type=large'
          photo: 'http://localhost:3000/photo/' + encrypt(profile.id)
        });

        newUser.save(function( err ) {
          return done(err, newUser);
        });
      }
    });
  })
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Cleanup database by removing any expired presences
 */
// crontab.scheduleJob('* * *', function() { /* Every day */
//   // Presence.find()
// });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Encrypt Facebook Id with Node CTR
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var password = 'd6F3Efeq';

function encrypt( text ) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, 'utf8', 'hex');

  crypted += cipher.final('hex');

  return crypted;
}
 
function decrypt( text ) {
  var decipher = crypto.createDecipher(algorithm, password);
  var decrypted = decipher.update(text, 'hex', 'utf8');

  decrypted += decipher.final('utf8');

  return decrypted;
}

// Proxy Facebook picture requests 
var proxy = process.env.http_proxy || 'http://localhost:' + app.get('port');

app.route('/photo/:id').get(function( req, res, next ) {
  var facebookId = decrypt(req.params.id);

  request.get('http://graph.facebook.com/' + facebookId + '/picture?type=large').pipe(res);
});

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
router.route('/auth/facebook').get(function( req, res, next ) {
  return passport.authenticate('facebook', {
    scope: facebookAuth.scope
  })(req, res, next);
});

router.route('/auth/facebook/callback').get(function( req, res, next ) {
  return passport.authenticate('facebook', {
    successRedirect: facebookAuth.successURL,
    failureRedirect: facebookAuth.failureURL
  })(req, res, next);
});

// Logout
router.route('/auth/logout').get(function( req, res ) {
  req.logout();
  res.redirect('/');
});

// Retrieve account
router.route('/account').get(isAuthenticated, function( req, res ) {
  User.findOne({ '_id': req.user._id }).exec(function( err, user ) {
    // Add 'released' and 'encountered' presence collections
    Presence.find({ 'creator': req.user._id }).exec(function( err, released ) {
      Encounter.find({ 'discoverer': req.user._id }).select('-_id presence').exec(function( err, encountered ) {
        // Extract presence Ids
        encountered = encountered.map(function( item ) { return item.presence; });

        _.extend(user, {
          'encountered': encountered,
          'released': released
        });

        User.populate(user, [
          { path: 'released', select: 'creator location' },
          { path: 'encountered', select: 'creator location' }
        ], function() {
          res.send(user);
        });
      });
    });
  });
});

// Retrieve all the presences found within the specified distance from the provided location
router.route('/presences/find/:lng/:lat/:distance').get(isAuthenticated, function( req, res ) {
  var params = _.extend(req.params, {
    'userId': req.user._id
  });

  Presence.findWithinRadius(params, function( err, presences ) {
    res.send(presences);
  });
});

// Message directory
// Show discovered presences and released presences which have been responded to

// Todo: Exclude discovered presences which have expired and the user has not responded to
router.route('/encounters').get(isAuthenticated, function( req, res ) {
  Encounter.find({ 'discoverer': req.user._id }).populate('creator discoverer presence').exec(function( err, discoverered ) {
    Encounter.find({ 'creator': req.user._id }).populate('creator discoverer presence').exec(function( err, released ) {
      var encounters = discoverered;
      var i = released.length;

      // async.waterfall([
      //   function() {
      //     if( discoverered.length ) {
      //       // Exclude discovered presences which have expired and the user has not responded to
      //     }
      //   },
      //   function() {
      //     if( released.length ) {
      //       // Find released presences which have been responded to
      //       _.each(released, function( err, encounter ) {
      //         Message.find({ 'presence': encounter.presence }).exec(function( err, messages ) {
      //           if( messages.length > 1 ) {
      //             encounters.push(encounter);
      //           }
      //         });
      //       });
      //     }
      //   }
      // ], function() {
      //   res.send(encounters);
      // });

      if( discoverered.length ) {
        // Exclude discovered presences which have expired and the user has not responded to
      }

      if( released.length ) {
        // Find released presences which have been responded to
        _.each(released, function( err, encounter ) {
          Message.find({ 'presence': encounter.presence }).exec(function( err, messages ) {
            if( messages.length > 1 ) {
              encounters.push(encounter);
            }

            if( --i === 0 ) {
              res.send(encounters);
            }
          });
        });
      } else {
        res.send(encounters);
      }
    });
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
// Todo: Validation: Ensure presence hasn't expired
router.route('/presences/:id/encounter').post(isAuthenticated, function( req, res ) {
  Presence.findOne({ '_id': req.params.id }).exec(function( err, presence ) {
    var encounter = {
      'presence': presence._id,
      'creator': presence.creator,
      'discoverer': req.user._id
    };

    if( req.body.response ) {
      var message = {
        'from': req.user._id,
        'presence': presence._id,
        'message': req.body.response
      };

      new Message(message).save(done);
    } else {
      done();
    }

    function done() {
      new Encounter(encounter).save(function( err, encounter ) {
        res.send(encounter);
      });
    }
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
    'created': new Date(),
    'creator': req.user._id,
    'location': req.body.location
  };

  new Presence(presence).save(function( err, presence ) {
    var message = {
      'from': req.user._id,
      'presence': presence._id,
      'message': req.body.question
    };

    new Message(message).save(function() {
      res.send(presence);
    });
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