'use strict';

const DynamicController = require('../controller/DynamicController');
const AuthenticationController = require('../controller/AuthenticationController');
const StaticController = require('../controller/StaticController.js');
const TeamController = require('../controller/TeamController');
const SponsoringController = require('../controller/SponsoringController');

const Router = require('co-router');
const multer = require('multer');

const registration = require('../controller/RegistrationController');
const liveblog = require('../controller/LiveblogController');
const session = require('../controller/SessionController');

const upload = multer({inMemory: true});
const router = new Router();

const funnelTemplate = renderTemplate('dynamic', 'register', 'funnel');

// router.get('/', redirectOnLogin, funnelTemplate('register'));

router.get('/honig', function (req, res, next) {
  req.params.teamId = 410;
  next();
}, TeamController.showTeamById);

router.get('/zwei', function (req, res, next) {
  req.params.teamId = 390;
  next();
}, TeamController.showTeamById);

router.get('/refresh', session.refreshSession, (req, res) => res.redirect('/'));

router.get('/register', StaticController.renderLandingpage); // client-side routing

router.get('/select-role', StaticController.renderLandingpage); // client-side routing

router.get('/participate', StaticController.renderLandingpage); // client-side routing

router.get('/create-team-success', StaticController.renderLandingpage); // client-side routing

// router.get('/invite-success', session.hasTeam, registration.lock, funnelTemplate('invite-success'));

router.get('/join-team-success', StaticController.renderLandingpage); // client-side routing

router.get('/sponsor-success', session.isSponsor, funnelTemplate('sponsor-success'));

router.get('/visitor-success', StaticController.renderLandingpage); // client-side routing

router.get('/teamDeletionSuccess', StaticController.renderLandingpage); // client-side routing

router.get('/invite', session.hasTeam, registration.lock, funnelTemplate('invite'));

router.get('/reset-password', StaticController.renderLandingpage); // client-side routing

router.get('/reset/:email/:token', funnelTemplate('reset-pw'));

router.get('/closed', funnelTemplate('closed'));

router.get('/sponsor-closed', funnelTemplate('sponsor-closed'));

router.get('/sponsor', session.isUser, SponsoringController.sponsoringIsOpenForAnyEvent, redirectIfSponsor,
  StaticController.renderLandingpage); // client-side routing

router.get('/login', StaticController.renderLandingpage); // client-side routing

router.get('/live', DynamicController.showLiveBlog);

router.get('/map', DynamicController.showMap);

router.get('/profile', session.isUser, DynamicController.showUserProfile);

router.get('/logout', session.isUser, DynamicController.logout);

router.get('/join-team-success', StaticController.renderLandingpage); // client-side routing

router.get('/join/:token', DynamicController.showInvitesByToken);

router.get('/team-invite', session.isParticipant, registration.lock, DynamicController.showInvites);

router.get('/isLoggedIn', DynamicController.isLoggedIn);

router.get('/create-join-team', StaticController.renderLandingpage); // client-side routing

router.get('/activation/:token', DynamicController.activateAccount);

router.get('/confirmEmailChange/:token', DynamicController.confirmEmailChange);

router.get('/highscore', DynamicController.showHighscores);

router.post('/liveblog/posting/', liveblog.returnPostings);

router.post('/liveblog/chooseEvent/', liveblog.chooseEvent);

router.post('/participant', session.isUser, upload.single('profilePic'), registration.createParticipant);

router.post('/register', registration.createUser);

router.post('/team-create', session.isParticipant, upload.single('profilePic'), registration.createTeam);

router.post('/invite', session.hasTeam, registration.inviteUser);

router.post('/team-invite', session.isParticipant, registration.joinTeamAPI);

// router.post('/sponsor', session.isUser, upload.single('profilePic'), registration.createSponsor);

router.post('/request-pw-reset', registration.requestPwReset);

router.post('/reset-pw', registration.resetPassword);

router.post('/login', AuthenticationController.login);

// Helper functions
function flashIfReturn(req, res, next) {
  if (req.query.return) req.flash('url', req.query.return);
  next();
}

function redirectIfSponsor(req, res, next) {
  if (req.user.status.is.sponsor) {
    return res.redirect('/settings/sponsoring');
  }
  next();
}

function renderTemplate(type, folder, layout) {
  return (template) => (req, res) => {

    let options = {
      error: req.flash('error'),
      success: req.flash('success'),
      layout: layout,
      language: req.language
    };

    if (req.user && req.user.me) {
      options.emailConfirmed = !req.user.me.blocked;
      options.status = req.user.status;
    }

    //give matched letiables from url to template for password reset
    if (req.params.token && req.params.email) {
      options.token = req.params.token;
      options.email = req.params.email;
    }

    res.render(`${type}/${folder}/${template}`, options);
  };
}

function redirectOnLogin(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/selection');
  return next();
}

module.exports = router;
