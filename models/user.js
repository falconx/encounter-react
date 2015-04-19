var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define the schema for our user model
var userSchema = mongoose.Schema({
      id: String,
      token: String,
      name: String
    });

// Ensure password is valid using bcrypt
userSchema.methods.validPassword = function( password ) {
  return bcrypt.compareSync(password, this.local.password);
};

// Hash the password and set the users password
userSchema.methods.hashPassword = function( password ) {
  var user = this;

  // Hash the password
  bcrypt.hash(password, null, null, function( err, hash ) {
     if( err ) {
        return next(err);
     }

      user.local.password = hash;
  });

};

// Create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);