var express = require('express');
var app = express();

var path = require('path');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var mongoose = require('mongoose');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var webpack = require('webpack');
var WebpackDevServer = require('../webpack.dev-config');
var webpackConfig = require('../webpack.config');

// Transparently require() jsx
require('node-jsx').install({
  extension: '.jsx',
  harmony: true
});

// User model for Passport
var User = require('./models/user');

// App config
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', express.static(path.resolve(__dirname + '/../templates')));
app.use('/public', express.static(path.resolve(__dirname + '/../public')));

// Express session
app.use(session({ secret: 'secret-encounter' }));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

var facebookAuth = require('./config/providers.json').facebook;

// Connect to data store
mongoose.connect('mongodb://localhost/encounter-react');

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

app.get('/auth/account', isAuthenticated, function( req, res ) {
  res.send(req.user);
});

app.get('/auth/logout', isAuthenticated, function( req, res ) {
  req.logout();
  res.redirect('/');
});

// Start server

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});

// new WebpackDevServer(webpack( webpackConfig ), {
//   publicPath: webpackConfig.output.publicPath,
//   hot: true,
//   historyApiFallback: true
// }).listen(app.get('port'), 'localhost', function( err, result ) {
//   if( err ) {
//     console.log( err );
//   }

//   console.log('Listening at localhost:' + app.get('port') + '/');
// });