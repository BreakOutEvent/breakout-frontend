'use strict';
const express = require('express');
const router = express.Router();

const registration = require('../controller/page-controller/registration');

const isAuth = (req, res, next) => {
  if(req.isAuthenticated)
    next();
  else
    res.sendStatus(403);
};

router.get('/participant', (req, res) =>
  res.render('admin/login',
    {
      path: '/admin',
      error: req.flash('error')
    }
  )
);

router.post('/participant', isAuth, registration.createParticipant);

module.exports = router;