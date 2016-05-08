'use strict';

/**
 * Controller for login and authentication.
 */

const passport = require('passport');
const co = require('co');
const _ = require('lodash');

const Strategy = require('passport-local').Strategy;

const API = requireLocal('services/api-proxy.js');


/**
 * Registers our strategy as login strategy in passport.
 */
passport.use(new Strategy((username, password, cb) => co(function*() {
  try {
    const user = yield passport.createSession(username, yield API.authenticate(username, password));
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

/**
 * Logins the user and fills req.user with all important information.
 * @param username
 * @param user
 */
passport.createSession = (username, user) => co(function*() {
  const me = yield API.getCurrentUserco(user);

  user.status = {
    is: {
      user: true,
      participant: false,
      sponsor: false,
      team: false,
      admin: false
    }
  };

  if (me.participant) {
    user.status.is.participant = true;
    if (me.participant.teamId) {
      user.status.is.team = true;
    }
  }

  if (_.includes(me.roles, 'ADMIN')) {
    user.status.is.admin = true;
  }

  user.email = username;
  user.me = me;
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + user.expires_in);
  user.expires_at = expiresAt;

  return user;
}).catch(ex => {
  console.log(ex);
  throw ex;
});

module.exports = passport;
