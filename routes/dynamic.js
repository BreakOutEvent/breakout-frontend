'use strict';

/**
 * Routes for all dynamic user pages.
 */

const express = require('express');
const co = require('co');
const multer = require('multer');

const passport = requireLocal('services/auth');
const registration = requireLocal('controller/page-controller/registration');
const profile = requireLocal('controller/page-controller/profile');
const liveblog = requireLocal('controller/page-controller/liveblog');
const session = requireLocal('controller/session');

const upload = multer({inMemory: true});
const router = express.Router();

const renderTemplate = (folder) => (template) => (req, res) => {

  let options = {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'funnel',
    language: req.language
  };

  if (req.user && req.user.me) {
    options.emailConfirmed = !req.user.me.blocked;
    options.status = req.user.status;
  }

  //give matched variables from url to template for password reset
  if (req.params.token && req.params.email) {
    options.token = req.params.token;
    options.email = req.params.email;
  }

  res.render(`dynamic/${folder}/${template}`, options);
};


const redirectOnLogin = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/selection');
  return next();
};

const funnelTemplate = renderTemplate('register');

//GET
router.get('/', redirectOnLogin, funnelTemplate('register'));
router.get('/login', redirectOnLogin, funnelTemplate('login'));
router.get('/register', redirectOnLogin, funnelTemplate('register'));
router.get('/selection', session.isUser, funnelTemplate('selection'));
router.get('/participant', session.isUser, registration.lock, funnelTemplate('participant'));
router.get('/team-success', session.hasTeam, registration.lock, funnelTemplate('team-success'));
router.get('/invite-success', session.hasTeam, registration.lock, funnelTemplate('invite-success'));
router.get('/payment-success', session.hasTeam, funnelTemplate('payment-success'));
router.get('/sponsor-success', session.isSponsor, funnelTemplate('sponsor-success'));
router.get('/spectator-success', session.isUser, funnelTemplate('spectator-success'));
router.get('/sponsor', session.isUser, funnelTemplate('sponsor'));
router.get('/invite', session.hasTeam, registration.lock, funnelTemplate('invite'));
router.get('/reset/:email/:token', funnelTemplate('reset-pw'));
router.get('/closed', funnelTemplate('closed'));

router.get('/liveblog', (req, res, next) => co(function*() {

  let events = yield liveblog.getEventInfos();
  let postings = yield liveblog.getAllPostings();
  let counter = yield liveblog.getCounterInfos(events.individual);

  console.log(events);

  res.render(`dynamic/liveblog/liveblog`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      events: events,
      postings: postings,
      counter: counter,
      isLoggedIn: req.user,
      title: 'Liveblog'
    });

}).catch(ex => next(ex)));


router.get('/profile', session.isUser, (req, res, next) => co(function*() {

  let team = null;

  if (req.user.status.is.team) {
    team = yield profile.getTeam(req);
  }

  res.render(`dynamic/profile/profile`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      team: team,
      title: 'Profile'
    });

}).catch(ex => next(ex)));

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

router.get('/team-invite', session.isParticipant, registration.lock, (req, res, next) => co(function*() {
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

router.get('/team-create', session.isParticipant, registration.lock, (req, res, next) => co(function*() {
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

router.post('/participant', session.isUser, upload.single('profilePic'),
  registration.createParticipant);
router.post('/register', registration.createUser);
router.post('/team-create', session.isParticipant, upload.single('profilePic'),
  registration.createTeam);
router.post('/invite', session.hasTeam, registration.inviteUser);
router.post('/team-invite', session.isParticipant, registration.joinTeamAPI);
router.post('/sponsor', session.isUser, upload.single('profilePic'), registration.createSponsor);

router.post('/request-pw-reset', registration.requestPwReset);
router.post('/reset-pw', registration.resetPassword);


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
