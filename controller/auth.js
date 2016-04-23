'use strict';

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const API = requireLocal('controller/api-proxy.js');
const co = require('co');

passport.use(new Strategy((username, password, cb) => co(function*() {
  try {
    const user = yield passport.createSession(username, yield API.authenticate(username, password));
    console.log(user);
    cb(null, user, { message: 'Successfully logged in' });
  } catch (ex) {
    let message = ex.message ? ex.message : ex.error_description;
    cb(null, false, { message: message });
  }
}).catch(ex => {
  throw ex;
})));

passport.serializeUser((user, cb) => cb(null, user));

passport.deserializeUser((user, cb) => cb(null, user));

passport.createSession = (username, user) => co(function*() {
  const me = yield API.getCurrentUserco(user);

  console.dir(me);

  user.isAdmin = !!('ADMIN' in me.roles);

  user.email = username;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + user.expires_in);
  user.expires_at = expiresAt;

  return user;
}).catch(ex => {
  throw ex;
});

module.exports = passport;
