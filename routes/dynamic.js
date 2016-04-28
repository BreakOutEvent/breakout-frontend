'use strict';
const express = require('express');
const router = express.Router();
const co = require('co');
const multer = require('multer');
const upload = multer({inMemory: true});
const passport = requireLocal('controller/auth');
const _ = require('lodash');

const registration = requireLocal('controller/page-controller/registration');

const generalAuth = (failURL, role, auth) => (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.me && auth(req.user.me)) {
    return next();
  } else {
    req.flash(`error`, `Um diese Seite aufzurufen, musst Du ${role} sein.`);
    res.redirect(failURL);
  }
};

const isUser = generalAuth('/login', 'eingeloggt', (me) => !!me);
const isParticipant = generalAuth('/selection', 'ein Teilnehmer', (me) => !!me.participant);
const isSponsor = generalAuth('/selection', 'ein Sponsor', (me) => !!me.sponsor);
const hasTeam = generalAuth('/team-invite', 'Teil eines Teams', (me) => !!me.participant.teamId);

const renderTemplate = (folder) => (template) => (req, res) => {

  let status = 'GUEST';
  let blocked = true;
  if (req.user && req.user.me) {
    status = 'OBSERVER';
    if (req.user.me.roles === []) {
      status = 'OBSERVER';
    } else if (_.includes(req.user.me.roles, 'PARTICIPANT')) {
      status = 'PARTICIPANT';
    } else {
      logger.error('No valid user role found for', req.user);
    }
    blocked = req.user.me.blocked;
  }

  res.render(`dynamic/${folder}/${template}`,
    {
      error: req.flash('error'),
      layout: 'funnel',
      lang: req.lang,
      emailConfirmed: !blocked,
      status: status
    });
};

const funnelTemplate = renderTemplate('register');
const profileTemplate = renderTemplate('profile');

//GET
router.get('/', funnelTemplate('register'));
router.get('/login', funnelTemplate('login'));
router.get('/register', funnelTemplate('register'));
router.get('/selection', isUser, funnelTemplate('selection'));
router.get('/participant', isUser, funnelTemplate('participant'));
router.get('/team-success', hasTeam, funnelTemplate('team-success'));
router.get('/invite-success', hasTeam, funnelTemplate('invite-success'));
router.get('/payment-success', hasTeam, funnelTemplate('payment-success'));
router.get('/sponsor-success', isSponsor, funnelTemplate('sponsor-success'));
router.get('/spectator-success', isUser, funnelTemplate('spectator-success'));
router.get('/sponsor', isUser, funnelTemplate('sponsor'));
router.get('/invite', hasTeam, funnelTemplate('invite'));
router.get('/profile', isUser, (req, res, next) =>
  res.render(`dynamic/profile/profile`,
    {
      error: req.flash('error'),
      layout: 'master',
      lang: req.lang
    })
);

router.get('/logout', isUser, (req, res, next) => co(function* () {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('/login');
}).catch(ex => next(ex)));

router.get('/payment', hasTeam, (req, res, next) => co(function*() {

  const purpose = yield registration.getTransactionPurpose(req);

  res.render(`dynamic/register/payment`,
    {
      error: req.flash('error'),
      layout: 'funnel',
      lang: req.lang,
      purpose: purpose
    }
  );
}).catch(ex => next(ex)));

router.get('/join/:token', (req, res, next) => co(function*() {
  let invite = yield registration.getInviteByToken(req.params.token);

  if (!invite) {
    res.render('dynamic/register/register',
      {
        error: 'Invitecode is not valid.',
        layout: 'funnel',
        lang: req.lang
      }
    );
  } else {
    res.render('dynamic/register/register',
      {
        error: req.flash('error'),
        layout: 'funnel',
        lang: req.lang,
        invite: invite
      }
    );
  }
}).catch(ex => next(ex)));

router.get('/team-invite', isParticipant, (req, res, next) => co(function*() {
  const teams = yield registration.getInvites(req);

  if (teams.length > 0) {
    res.render('dynamic/register/team-invite',
      {
        error: req.flash('error'),
        layout: 'funnel',
        lang: req.lang,
        amountInvites: teams.length,
        teams: teams
      }
    );
  } else {
    res.redirect('/team-create');
  }
}).catch(ex => next(ex)));

router.get('/team-create', isParticipant, (req, res, next) => co(function*() {
  registration.getEvents(req)
    .then(events => {
      res.render('dynamic/register/team-create',
        {
          layout: 'funnel',
          lang: req.lang,
          events: events
        }
      );
    })
    .catch(err => {
      /*
       res.render('dynamic/register/team-create',
       {
       error: err.error,
       layout: 'funnel',
       lang: req.lang
       }
       );
       */
      next(err);
    });
}).catch(ex => next(ex)));

router.get('/activation/:token', (req, res, next) => co(function*() {

  registration.activateUser(req.params.token)
    .then(() => {
      res.render('dynamic/register/activation',
        {
          error: null,
          layout: 'funnel',
          lang: req.lang
        }
      );
    })
    .catch(err => {
      res.render('dynamic/register/activation',
        {
          error: 'The token you provided is not valid (anymore).',
          layout: 'funnel',
          lang: req.lang
        });
      throw err;
    });

}).catch(err => next(err)));

//POST

router.post('/participant', isUser, upload.single('profilePic'), registration.createParticipant);
router.post('/register', registration.createUser);
router.post('/team-create', isParticipant, upload.single('profilePic'), registration.createTeam);
router.post('/invite', hasTeam, registration.inviteUser);
router.post('/team-invite', isParticipant, registration.joinTeamAPI);

router.post('/login',
  passport.authenticate('local',
    {
      failureRedirect: '/login',
      successRedirect: '/selection',
      failureFlash: true,
      successFlash: true
    }
  )
);

module.exports = router;
