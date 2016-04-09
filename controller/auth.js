'use strict';

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const API = requireLocal('controller/api-proxy.js');
const mongoose = requireLocal('controller/mongo.js');
const Token = mongoose.model('token', requireLocal('schemas/token.js'));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

passport.use(new Strategy(
  (username, password, cb) => {
    console.log('[AUTH] Sending Username / Password to Backend');
    API.authenticate(username, password)
      .then(body => {
        console.log('[AUTH] Got positive response');
        var token = new Token(body);
        token.save();
        console.log('[AUTH] Successfully saved user');
        cb(null, token, { message: 'Successfully logged in' });
      })
      .catch(body => {
        console.log('[AUTH] Got negative response');
        cb(null, false, { message: body.error_description });
      }
    );
  }
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

passport.serializeUser((token, cb) => cb(null, token._id));

passport.deserializeUser((id, cb) => {
  console.log('[AUTH] Trying to find user in DB');
  Token.findById(id)
      .then(function (token) {
        console.log('[AUTH] Found user in DB');
        cb(null, token);
      })
      .catch(function (err) {
        console.log('[AUTH] No user found');
        cb(err);
      });
}
);

module.exports = passport;
