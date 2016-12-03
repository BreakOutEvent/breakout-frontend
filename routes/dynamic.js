'use strict';

const DynamicController = require('../controller/page-controller/DynamicController');
const AuthenticationController = require('../controller/page-controller/AuthenticationController');
const Router = require('co-router');
const multer = require('multer');

const registration = require('../controller/page-controller/registration');
const liveblog = require('../controller/page-controller/liveblog');
const session = require('../controller/session');

const upload = multer({inMemory: true});
const router = new Router();

const funnelTemplate = renderTemplate('dynamic', 'register', 'funnel');

// router.get('/', redirectOnLogin, funnelTemplate('register'));

router.get('/register', redirectOnLogin, funnelTemplate('register'));

router.get('/selection', session.isUser, funnelTemplate('selection'));

router.get('/participant', session.isUser, registration.lock, funnelTemplate('participant'));

router.get('/team-success', session.hasTeam, registration.lock, funnelTemplate('team-success'));

router.get('/invite-success', session.hasTeam, registration.lock, funnelTemplate('invite-success'));

router.get('/payment-success', session.hasTeam, funnelTemplate('payment-success'));

router.get('/sponsor-success', session.isSponsor, funnelTemplate('sponsor-success'));

router.get('/spectator-success', session.isUser, funnelTemplate('spectator-success'));

router.get('/invite', session.hasTeam, registration.lock, funnelTemplate('invite'));

router.get('/reset/:email/:token', funnelTemplate('reset-pw'));

router.get('/closed', funnelTemplate('closed'));

router.get('/sponsor', session.isUser, redirectIfSponsor, funnelTemplate('sponsor'));

router.get('/login', redirectOnLogin, flashIfReturn, funnelTemplate('login'));

router.get('/live', DynamicController.showLiveBlog);

router.get('/profile', session.isUser, DynamicController.showUserProfile);

router.get('/logout', session.isUser, DynamicController.logout);

router.get('/payment', session.hasTeam, DynamicController.showTransactionPurpose);

router.get('/join/:token', DynamicController.showInvitesByToken);

router.get('/team-invite', session.isParticipant, registration.lock, DynamicController.showInvites);

router.get('/team-create', session.isParticipant, registration.lock, DynamicController.showCreateTeamPage);

router.get('/activation/:token', DynamicController.activateAccount);

router.get('/sponsoring', DynamicController.showHowToSponsor);

router.get('/highscore', DynamicController.showHighscores);


router.post('/liveblog/posting/', liveblog.returnPostings);

router.post('/participant', session.isUser, upload.single('profilePic'), registration.createParticipant);

router.post('/register', registration.createUser);

router.post('/team-create', session.isParticipant, upload.single('profilePic'), registration.createTeam);

router.post('/invite', session.hasTeam, registration.inviteUser);

router.post('/team-invite', session.isParticipant, registration.joinTeamAPI);

router.post('/sponsor', session.isUser, upload.single('profilePic'), registration.createSponsor);

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
