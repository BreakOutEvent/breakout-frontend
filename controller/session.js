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

  req.user.status = {
    string: 'GUEST',
    is: {
      user: false,
      participant: false,
      sponsor: false,
      team: false
    }
  };

  req.user.status.string = 'GUEST';
  if (req.user && req.user.me) {
    req.user.status.string = 'OBSERVER';
    req.user.status.is.user = true;
    if (req.user.me.participant) {
      req.user.status.string = 'PARTICIPANT';
      req.user.status.is.participant = true;
      if(req.user.me.participant.teamId) {
        req.user.status.string = 'TEAMMEMBER';
        req.user.status.is.team = true;
      }
    } else {
      logger.warn('No valid user role found for', req.user);
    }
  }

  if (req.isAuthenticated() && req.user && req.user.me && auth(req.user.me)) {
    return next();
  } else {
    req.flash(`error`, `Um diese Seite aufzurufen, musst Du ${role} sein.`);
    res.redirect(failURL);
  }
};


ses.isUser = session.generalAuth('/login', 'eingeloggt', (me) => !!me);
ses.isParticipant = session.generalAuth('/selection', 'ein Teilnehmer', (me) => !!me.participant);
ses.isSponsor = session.generalAuth('/selection', 'ein Sponsor', (me) => !!me.sponsor);
ses.hasTeam = session.generalAuth('/team-invite', 'Teil eines Teams', (me) => !!me.participant.teamId);
ses.isAdmin = session.generalAuth('/login', 'Administrator', (me) => me.email === 'admin@break-out.org');

module.exports = ses;
