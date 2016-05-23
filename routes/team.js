'use strict';

/**
 * Routes for all team related requests
 */

const express = require('express');
const co = require('co');
const multer = require('multer');

const team = requireLocal('controller/page-controller/team');
const session = requireLocal('controller/session');

const upload = multer({inMemory: true});
const router = express.Router();

router.get('/:teamId', (req, res, next) => co(function*() {
  const currTeam = yield team.getTeamByUrl(req.params.teamId);

  let currentUser = null;

  if(req.user && req.user.me) {
    currentUser = req.user.me;
  }

  console.log(currTeam);

  res.render(`dynamic/team/team-detail`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      team: currTeam,
      user: currentUser,
      title: currTeam.name
    });
}).catch(next));

router.post('/post/create', session.hasTeam, upload.single('postPic'), team.createPost);

module.exports = router;