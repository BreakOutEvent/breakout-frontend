/**
 * Router for /admin
 */

'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/login', function (req, res, next) {
  res.render('login',
    {
      path: '/admin',
      error: req.flash('error')
    }
  );
});

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

router.use(function(req, res, next){
  if(req.isAuthenticated())
    return next();
  res.redirect('/admin/login')
});

router.get('/logout',
  function (req, res) {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/admin/');
  }
);

router.get('/', function (req, res) {
    res.redirect('/admin/cms/');
});

router.use('/cms', express.static('./public/cms/dist'));

module.exports = router;