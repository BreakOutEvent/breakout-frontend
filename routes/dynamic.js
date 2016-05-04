'use strict';
const express = require('express');
const router = express.Router();
const co = require('co');
const multer = require('multer');
const upload = multer({inMemory: true});
const passport = requireLocal('controller/auth');
const _ = require('lodash');

const registration = requireLocal('controller/page-controller/registration');
const profile = requireLocal('controller/page-controller/profile');
const session = requireLocal('controller/session');

const renderTemplate = (folder) => (template) => (req, res) =>
  res.render(`dynamic/${folder}/${template}`,
    {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: 'funnel',
      language: req.language,
      emailConfirmed: !req.user.me.blocked,
      status: req.user.status
    });

const funnelTemplate = renderTemplate('register');

//GET
router.get('/', funnelTemplate('register'));
router.get('/login', funnelTemplate('login'));
router.get('/register', funnelTemplate('register'));
router.get('/selection', session.isUser, funnelTemplate('selection'));
router.get('/participant', session.isUser, funnelTemplate('participant'));
router.get('/team-success', session.hasTeam, funnelTemplate('team-success'));
router.get('/invite-success', session.hasTeam, funnelTemplate('invite-success'));
router.get('/payment-success', session.hasTeam, funnelTemplate('payment-success'));
router.get('/sponsor-success', session.isSponsor, funnelTemplate('sponsor-success'));
router.get('/spectator-success', session.isUser, funnelTemplate('spectator-success'));
router.get('/sponsor', session.isUser, funnelTemplate('sponsor'));
router.get('/invite', session.hasTeam, funnelTemplate('invite'));

router.get('/profile', session.isUser, (req, res, next) =>
  res.render(`dynamic/profile/profile`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      title: 'Profile'
    })
);

router.get('/logout', session.isUser, (req, res, next) => co(function*() {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('/login');
}).catch(ex => next(ex)));

router.get('/payment', session.hasTeam, (req, res, next) => co(function*() {

  const purpose = yield registration.getTransactionPurpose(req);

  res.render(`dynamic/register/payment`,
    {
      error: req.flash('error'),
      layout: 'funnel',
      language: req.language,
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
        language: req.language
      }
    );
  } else {
    res.render('dynamic/register/register',
      {
        error: req.flash('error'),
        layout: 'funnel',
        language: req.language,
        invite: invite
      }
    );
  }
}).catch(ex => next(ex)));

router.get('/team-invite', session.isParticipant, (req, res, next) => co(function*() {
  const teams = yield registration.getInvites(req);

  if (teams.length > 0) {
    res.render('dynamic/register/team-invite',
      {
        error: req.flash('error'),
        layout: 'funnel',
        language: req.language,
        amountInvites: teams.length,
        teams: teams
      }
    );
  } else {
    res.redirect('/team-create');
  }
}).catch(ex => next(ex)));

router.get('/team-create', session.isParticipant, (req, res, next) => co(function*() {
  registration.getEvents(req)
    .then(events => {
      res.render('dynamic/register/team-create',
        {
          layout: 'funnel',
          language: req.language,
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
       language: req.language
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
          language: req.language
        }
      );
    })
    .catch(err => {
      res.render('dynamic/register/activation',
        {
          error: 'The token you provided is not valid (anymore).',
          layout: 'funnel',
          language: req.language
        });
      throw err;
    });

}).catch(err => next(err)));

//POST

router.post('/participant', session.isUser, upload.single('profilePic'), registration.createParticipant);
router.post('/register', registration.createUser);
router.post('/team-create', session.isParticipant, upload.single('profilePic'), registration.createTeam);
router.post('/invite', session.hasTeam, registration.inviteUser);
router.post('/team-invite', session.isParticipant, registration.joinTeamAPI);

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

router.put('/team', session.hasTeam, upload.single('profilePic'), profile.putTeam);

module.exports = router;
