'use strict';
const express = require('express');
const router = express.Router();
const co = require('co');
const multer = require('multer');
const upload = multer({ inMemory: true });

const registration = requireLocal('controller/page-controller/registration');

const isAuth = (req, res, next) => {
  if (req.isAuthenticated)
    next();
  else
    return next();
  //res.sendStatus(403);
  // TODO: Re-Enable 403
};

router.get('/register', (req, res) =>
  res.render('dynamic/register/participant-form',
    {
      error: req.flash('error'),
      layout: 'funnel',
      language: 'de'
    }
  )
);

router.get('/selection', (req, res) =>
  res.render('dynamic/register/selection',
    {
      error: req.flash('error'),
      layout: 'funnel',
      lang: req.lang
    }
  )
);

router.get('/participant', (req, res) =>
  res.render('dynamic/register/participant-form',
    {
      error: req.flash('error'),
      layout: 'funnel',
      language: 'de'
    }
  )
);

router.get('/team-invite', (req, res, next) => co(function*() {
  const teams = yield registration.getInvites(req);

  if (teams.length > 0) {
    res.render('dynamic/register/team-invite',
      {
        error: req.flash('error'),
        layout: 'funnel',
        language: 'de',
        amountInvites: teams.length,
        teams: teams
      }
    )
  } else {
    //TODO make dynamic
    res.redirect('/team-create');
  }
}).catch(ex => next(ex)));

router.get('/team-create', (req, res) => {

  registration.getEvents(req)
    .then(events => {
      res.render('dynamic/register/team-create',
        {
          layout: 'funnel',
          lang: req.lang,
          events: events
        }
      )
    })
    .catch(err => {
      res.render('dynamic/register/team-create',
        {
          error: err.error,
          layout: 'funnel',
          lang: req.lang
        }
      )
    })


});



router.post('/participant', isAuth, function(req, res, next) {
  next();
},upload.single('profilePic'), registration.createParticipant);
//router.post('/team-create', isAuth, upload.single('profilePic'), registration.createTeam);

module.exports = router;