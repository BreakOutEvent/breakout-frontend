'use strict';

/**
 * Routes for all dynamic user pages.
 */

const co = require('co');
const multer = require('multer');
const _ = require('lodash');

const passport = requireLocal('services/auth');
const registration = requireLocal('controller/page-controller/registration');
const profile = requireLocal('controller/page-controller/profile');
const liveblog = requireLocal('controller/page-controller/liveblog');
const team = requireLocal('controller/page-controller/team');
const session = requireLocal('controller/session');


const upload = multer({inMemory: true});
const Router = require('co-router');
const router = new Router();

const renderTemplate = (type, folder, layout) => (template) => (req, res) => {

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

  //give matched variables from url to template for password reset
  if (req.params.token && req.params.email) {
    options.token = req.params.token;
    options.email = req.params.email;
  }

  res.render(`${type}/${folder}/${template}`, options);
};


const redirectOnLogin = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/selection');
  return next();
};

const funnelTemplate = renderTemplate('dynamic', 'register', 'funnel');

//GET
//router.get('/', redirectOnLogin, funnelTemplate('register'));
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

router.get('/login', redirectOnLogin, (req, res, next) => {
  if (req.query.return) req.flash('url', req.query.return);
  next();
}, funnelTemplate('login'));

router.get('/sponsor', session.isUser, (req, res, next) => {
  if (req.user.status.is.sponsor) {
    return res.redirect('/settings/sponsoring');
  }
  next();
}, funnelTemplate('sponsor'));


router.post('/liveblog/posting/', liveblog.returnPostings);

router.get('/live', function*(req, res) {

  var token = null;
  if (req.isAuthenticated()) token = req.user;

  let isUserAdmin = false;

  if (req.user && req.user.me) {
    isUserAdmin = _.findIndex(req.user.me.roles, r => r === 'ADMIN') > -1;
  }

  var options = yield {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    events: liveblog.getEventInfos(),
    postings: liveblog.getAllPostings(token),
    mapData: liveblog.getMapData(),
    isLoggedIn: req.user,
    isUserAdmin: isUserAdmin,
    title: 'Liveblog'
  };

  options.counter = yield liveblog.getCounterInfos(options.events.individual);

  res.render('dynamic/liveblog/liveblog', options);

});

router.get('/profile', session.isUser, function *(req, res) {

  let team = null;

  if (req.user.status.is.team) {
    team = yield profile.getTeam(req);
  }

  res.render('dynamic/profile/profile', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    me: req.user.me,
    team: team,
    title: 'Profile'
  });

});

router.get('/logout', session.isUser, function *(req, res) {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('/login');
});

router.get('/payment', session.hasTeam, function *(req, res) {

  const purpose = yield registration.getTransactionPurpose(req);

  res.render('dynamic/register/payment', {
    error: req.flash('error'),
    layout: 'funnel',
    language: req.language,
    purpose: purpose
  });

});

router.get('/join/:token', function*(req, res) {
  let invite = yield registration.getInviteByToken(req.params.token);

  // TODO: This error handling is not correct! Invite is not null if backend returns an error json!
  if (!invite) {
    res.render('dynamic/register/register', {
      error: 'Invitecode is not valid.',
      layout: 'funnel',
      language: req.language
    });
  } else {
    res.render('dynamic/register/register', {
      error: req.flash('error'),
      layout: 'funnel',
      language: req.language,
      invite: invite
    });
  }
});

router.get('/team-invite', session.isParticipant, registration.lock, function*(req, res) {
  const teams = yield registration.getInvites(req);

  if (teams.length > 0) {
    res.render('dynamic/register/team-invite', {
      error: req.flash('error'),
      layout: 'funnel',
      language: req.language,
      amountInvites: teams.length,
      teams: teams
    });
  } else {
    res.redirect('/team-create');
  }
});

// TODO: Refactor this in order to use yield!
router.get('/team-create', session.isParticipant, registration.lock, function *(req, res, next) {
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
      // TODO: Find out why this is commented out!
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
});

router.get('/activation/:token', function *(req, res) {

  try {
    yield registration.activateUser(req.params.token);
    yield session.refreshSession(req);

    res.render('dynamic/register/activation', {
      error: null,
      layout: 'funnel',
      language: req.language
    });

  } catch (err) {
    res.render('dynamic/register/activation', {
      error: 'The token you provided is not valid (anymore).',
      layout: 'funnel',
      language: req.language
    });
  }
});

router.get('/highscore', function *(req, res) {

  var map = yield liveblog.getMapData();
  var allTeams = yield team.getAll();

  var sortedTeamsbyDistance = ( _.sortBy(allTeams, t => t.distance.linear_distance)).reverse();

  var sortedTeamsbyMoney = (_.sortBy(allTeams, y => y.donateSum.full_sum)).reverse();

  var slicedDistance = sortedTeamsbyDistance.slice(0, 5);
  var slicedMoney = sortedTeamsbyMoney.slice(0, 5);


  res.render('dynamic/liveblog/highscore', {
    error: null,
    layout: 'master',
    language: req.language,
    mapData: map,
    teamDistanceData: slicedDistance,
    teamMoneyData: slicedMoney
  });

});

router.get('/sponsoring', function* (req, res) {
  res.render('static/howtosponsor', {
    error: null,
    layout: 'master',
    language: req.language
  });
});

//POST

router.post('/participant', session.isUser, upload.single('profilePic'), registration.createParticipant);
router.post('/register', registration.createUser);
router.post('/team-create', session.isParticipant, upload.single('profilePic'), registration.createTeam);
router.post('/invite', session.hasTeam, registration.inviteUser);
router.post('/team-invite', session.isParticipant, registration.joinTeamAPI);
router.post('/sponsor', session.isUser, upload.single('profilePic'), registration.createSponsor);
router.post('/request-pw-reset', registration.requestPwReset);
router.post('/reset-pw', registration.resetPassword);

// TODO: Add proper logging here!
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', 'Ungültige Kombination aus Email und Passwort');
      return res.redirect('/login');
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      var url = req.flash('url');
      if (Array.isArray(url)) url = url[url.length - 1];
      if (url) return res.redirect(url);
      return res.redirect('/');
    });
  })(req, res, next);
});

module.exports = router;
