'use strict';
const express = require('express');
const router = express.Router();

const registration = requireLocal('controller/page-controller/registration');

const isAuth = (req, res, next) => {
  if(req.isAuthenticated)
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


router.get('/participant', (req, res) =>
  res.render('dynamic/register/participant-form',
    {
      error: req.flash('error'),
      layout: 'funnel',
      language: 'de'
    }
  )
);

router.post('/participant', isAuth, registration.createParticipant);

module.exports = router;