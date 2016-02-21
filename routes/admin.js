/**
 * Router for /admin
 */

'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.sendFile('admin/index.html', {root: __dirname+"/../"});
  /*res.render('admin/home',
    {
      layout: 'admin',
      path: '/admin',
      success: req.flash('success'),
      user: req.user
    }
  );*/
});

router.get('/about', function (req, res, next) {
  res.render('admin/about',
    {
      layout: 'admin',
      path: '/admin',
      user: req.user
    }
  );
});

router.get('/contact', function (req, res, next) {
  res.render('admin/contact',
    {
      layout: 'admin',
      path: '/admin',
      user: req.user
    }
  );
});

router.get('/login', function (req, res, next) {
  res.render('admin/login',
    {
      layout: 'admin',
      path: '/admin',
      error: req.flash('error')
    }
  );
});

router.post('/login',
  passport.authenticate('local',
    {
      failureRedirect: '/admin/login',
      //failureFlash: "Login not successful",
      successRedirect: '/admin',
      //successFlash: "Successfully logged in!"
      failureFlash: true,
      successFlash: true
    }
  )
);


router.get('/logout',
  function (req, res) {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/admin/');
  }
);

module.exports = router;