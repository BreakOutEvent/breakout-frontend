'use strict';
const express = require('express');
const router = express.Router();

const registration = requireLocal('controller/page-controller/registration');

const isAuth = (req, res, next) => {
  if (req.isAuthenticated)
    next();
  else
    return next();
  //res.sendStatus(403);
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
      language: 'de'
    }
  )
);

router.get('/participant', (req, res) =>
  res.render('dynamic/register/participant-form',
    {
      error: req.flash('error'),
      layout: 'funnel',
      language: 'de',
    }
  )
);

router.get('/invitelist', (req, res) => {

  registration.getInvites(req, res)
    .then(teams => {
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
        res.redirect('/team');
      }
    })
    .catch(err => {
      console.log(err);
      res.render('dynamic/register/team-invite',
        {
          error: err.error,
          layout: 'funnel',
          language: 'de',
          amountInvites: 0
        }
      )
    });

});

router.post('/participant', isAuth, registration.createParticipant);

module.exports = router;