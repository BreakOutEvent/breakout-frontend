'use strict';
const api = requireLocal('controller/api-proxy');
const passport = requireLocal('controller/auth');
const co = require('co');

let ses = {};

ses.refreshSession = (req) => co(function*() {
  req.login(yield passport.createSession(req.user.email, req.user), (error) => {
    if (error) throw error;

  });
}).catch(ex => {
  throw ex;
});

ses.generalAuth = (failURL, role, auth) => (req, res, next) => {
  if (req.isAuthenticated() && auth(req.user.status)) {
    return next();
  } else {
    req.flash(`error`, `Um diese Seite aufzurufen, musst Du ${role} sein.`);
    res.redirect(failURL);
  }
};


ses.isUser = ses.generalAuth('/login', 'eingeloggt', (status) => status.is.user);
ses.isParticipant = ses.generalAuth('/selection', 'ein Teilnehmer', (status) => status.is.participant);
ses.isSponsor = ses.generalAuth('/selection', 'ein Sponsor', (status) => status.is.sponsor);
ses.hasTeam = ses.generalAuth('/team-invite', 'Teil eines Teams', (status) => status.is.team);
ses.isAdmin = ses.generalAuth('/login', 'Administrator', (status) => status.is.admin);

module.exports = ses;
