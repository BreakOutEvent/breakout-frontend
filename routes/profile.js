'use strict';

/**
 * Routes for all profile related requests
 */

const express = require('express');
const co = require('co');
const multer = require('multer');

const registration = requireLocal('controller/page-controller/registration');
const profile = requireLocal('controller/page-controller/profile');
const session = requireLocal('controller/session');

const upload = multer({ inMemory: true });
const router = express.Router();

router.get('/profile', session.isUser, (req, res, next) => co(function*() {

  let team = null;

  if(req.user.status.is.team) {
    team = yield profile.getTeam(req);
  }

  res.render(`dynamic/profile/profile`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      team: team,
      title: 'Profile'
    });

}).catch(ex => next(ex)));

router.put('/team', session.hasTeam, upload.single('teamPic'), profile.putTeam);
