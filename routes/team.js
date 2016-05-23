'use strict';

/**
 * Routes for all team related requests
 */

const express = require('express');
const co = require('co');
const multer = require('multer');
const _ = require('lodash');

const team = requireLocal('controller/page-controller/team');
const session = requireLocal('controller/session');

const upload = multer({inMemory: true});
const router = express.Router();

router.get('/:teamId', (req, res, next) => co(function*() {
  const currTeam = yield team.getTeamByUrl(req.params.teamId);

  let currentUser = null;
  let isUserOfTeam = false;

  if(req.user && req.user.me) {
    currentUser = req.user.me;
    isUserOfTeam = _.findIndex(currTeam.members, m => m.id == currentUser.id) > -1;
  }
  
  res.render(`dynamic/team/team-detail`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      team: currTeam,
      user: currentUser,
      isUserOfTeam: isUserOfTeam,
      title: currTeam.name
    });
}).catch(next));

router.post('/post/create', session.hasTeam, upload.single('postPic'), team.createPost);
router.post('/like', session.isUser, team.createLike);

module.exports = router;