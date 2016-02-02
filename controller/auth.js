var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var API = require('./apiProxy.js');

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.

passport.use(new Strategy(
  function (username, password, cb) {
    API.authenticate(username, password)
      .then(function(body) {
        cb(null, body, {message: 'Successfully logged in'});
      })
      .catch(function(response) {
        if(response.statusCode == 401) {
          cb(null, false, {message: 'Authorization Failed!'});
        } else {
          cb(null, false, {message: 'Server Error!'});
        }
      });
  }
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

passport.serializeUser(function (user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function (id, cb) {
  User.findById(id)
    .then(function (user) {
      cb(null, user)
    })
    .catch(function (err) {
      cb(err)
    });
});
