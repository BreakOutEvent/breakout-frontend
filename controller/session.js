'use strict';

/**
 * Refreshes the session if expired and provides user roles.
 */

const co = require('co');

const api = require('../services/api-proxy');
const passport = require('../services/auth');

let ses = {};

/**
 * Refreshes the session if it is expired.
 * @param req
 */
ses.refreshSession = (req, res, next) => co(function*() {

  if (!req.user) {
    next();
  }

  req.login(yield passport.createSession(req.user.email, req.user), (error) => {
    if (error) next(error);
    if (next) next();
  });
}).catch(ex => {
  throw ex;
});

/**
 * Middleware to ensure the user is properly authenticated, tells the user what went wrong.
 * @param failURL
 * @param role
 * @param auth
 */
ses.generalAuth = (failURL, role, auth) => (req, res, next) => {
  if (req.isAuthenticated() && auth(req.user.status)) {
    return next();
  } else {
    req.flash('error', `Um diese Seite aufzurufen, musst Du ${role} sein.`);
    req.flash('url', req.originalUrl);
    res.redirect(failURL);
  }
};

ses.isUser = ses.generalAuth('/login', 'eingeloggt', (status) => status.is.user);
ses.isParticipant = ses.generalAuth('/selection', 'ein Teilnehmer', (status) => status.is.participant);
ses.isSponsor = ses.generalAuth('/selection', 'ein Sponsor', (status) => status.is.sponsor);
ses.hasTeam = ses.generalAuth('/team-invite', 'Teil eines Teams', (status) => status.is.team);
ses.isAdmin = ses.generalAuth('/login', 'Administrator', (status) => status.is.admin);

module.exports = ses;
