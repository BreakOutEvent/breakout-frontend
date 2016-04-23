'use strict';
const express = require('express');
const router = express.Router();
const co = require('co');
const multer = require('multer');
const upload = multer({ inMemory: true });
const passport = requireLocal('controller/auth');

const registration = requireLocal('controller/page-controller/registration');
const payment = requireLocal('controller/page-controller/payment');

const isAuth = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  else
    return next();

  //res.sendStatus(403);
  // TODO: Re-Enable 403
};

const funnelTemplate = (template) => (req, res) => {
  console.log('render');
  res.render(`dynamic/register/${template}`,
    {
      error: req.flash('error'),
      layout: 'funnel',
      lang: req.lang
    }
  );
};


//GET

router.get('/login', funnelTemplate('login'));
router.get('/register', funnelTemplate('register'));
router.get('/selection', funnelTemplate('selection'));
router.get('/participant', funnelTemplate('participant'));
router.get('/team-success', funnelTemplate('team-success'));
router.get('/sponsor-success', funnelTemplate('sponsor-success'));
router.get('/spectator-success', funnelTemplate('spectator-success'));
router.get('/participant', funnelTemplate('participant'));
router.get('/sponsor', funnelTemplate('sponsor'));
router.get('/invite', funnelTemplate('invite'));


router.get('/payment-token', isAuth, payment.getToken);

router.get('/logout',
  (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/login');
  }
);

router.get('/payment', (req, res, next) => co(function*() {

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

  invite = {
    team: 1,
    email: 'invitee@mail.com',
    creator: 'creator@mail.com',
    token: 'thetokenyougavemeattheapi'
  };

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

router.get('/team-invite', (req, res, next) => co(function*() {
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

router.get('/team-create', (req, res, next) => {
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
});

//POST

router.post('/participant', isAuth, upload.single('profilePic'), registration.createParticipant);
router.post('/register', isAuth, registration.createUser);
router.post('/team-create', isAuth, upload.single('profilePic'), registration.createTeam);
router.post('/join', isAuth, upload.single('profilePic'), registration.joinTeamAPI);
router.post('/payment-checkout', isAuth, payment.checkout);
router.post('/invite', isAuth, registration.inviteUser);

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
