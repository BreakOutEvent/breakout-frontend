'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/login', (req, res) =>
  res.render('admin/login',
    {
      path: '/admin',
      error: req.flash('error')
    }
  )
);

router.post('/login',
  passport.authenticate('local',
    {
      failureRedirect: '/admin/login',
      successRedirect: '/admin/cms',
      failureFlash: true,
      successFlash: true
    }
  )
);

router.use((req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/admin/login');
});

router.get('/logout',
  (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/admin/');
  }
);

router.get('/', (req, res) => {
  if(req.isAuthenticated())
    console.log(req.user);
  res.redirect('/admin/cms/');
});

router.use('/cms', express.static('./public/cms/dist'));

module.exports = router;
