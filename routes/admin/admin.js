'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/login', (req, res) =>
  res.render('static/admin/login',
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
  if (req.isAuthenticated() && req.user.isAdmin)
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
  res.redirect('/admin/cms/');
});

router.use('/cms', express.static('./public/cms'));

module.exports = router;
