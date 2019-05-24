'use strict';

/**
 * Refreshes the session if expired and provides user roles.
 */

const co = require('co');

const api = require('../services/api-proxy');
const passport = require('../services/auth');
const logger = require('../services/logger.js');

let ses = {};

/**
 * Refreshes the session if it is expired.
 * @param req
 */
ses.refreshSession = (req, res, next) => co(function*() {

  if (!req.user) {
    if (next) next();
  } else {
    const session = yield passport.createSession(req.user.email, req.user);

    req.login(session, (error) => {
      if (error) next(error);
      if (next) next();
    });
  }

}).catch(ex => {
  logger.error('Rethrowing error: ' + ex);
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
    res.redirect(failURL+'?refer='+req.originalUrl);
  }
};

ses.isUser = ses.generalAuth('/login', 'eingeloggt', (status) => status.is.user);
ses.isParticipant = ses.generalAuth('/select-role', 'ein Teilnehmer', (status) => status.is.participant);
ses.isSponsor = ses.generalAuth('/select-role', 'ein Sponsor', (status) => status.is.sponsor);
ses.hasTeam = ses.generalAuth('/team-invite', 'Teil eines Teams', (status) => status.is.team);
ses.isAdmin = ses.generalAuth('/login', 'Administrator', (status) => status.is.admin);

module.exports = ses;
