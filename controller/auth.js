'use strict';

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const API = require('./apiProxy.js');
const mongoose = require('./mongo.js');
const Token = mongoose.model('token', require('../schemas/token.js'));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

passport.use(new Strategy(
  (username, password, cb) =>
    API.authenticate(username, password)
      .then(body => {
        var token = new Token(body);
        token.save();
        cb(null, token, {message: 'Successfully logged in'});
      })
      .catch(body =>
        cb(null, false, {message: body.error_description})
      )
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

passport.serializeUser((token, cb) => cb(null, token._id));

passport.deserializeUser((id, cb) =>
  Token.findById(id)
    .then(function (token) {
      cb(null, token);
    })
    .catch(function (err) {
      cb(err);
    })
);

module.exports = passport;