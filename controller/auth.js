'use strict';

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const API = requireLocal('controller/api-proxy.js');
const co = require('co');

passport.use(new Strategy((username, password, cb) => co(function*() {
  try {
    const user = passport.createSession(username, yield API.authenticate(username, password));
    cb(null, user, { message: 'Successfully logged in' });
  } catch (ex) {
    cb(null, false, { message: ex.error_description });
  }
}).catch(ex => {
  throw ex;
})));

passport.serializeUser((user, cb) => cb(null, user));

passport.deserializeUser((user, cb) => cb(null, user));

passport.createSession = (username, user) => {
  user.email = username;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + user.expires_in);
  user.expires_at = expiresAt;
  return user;
};

module.exports = passport;
