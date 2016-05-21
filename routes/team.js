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

router.get('/team/:teamId', (req, res, next) => co(function*() {
  const currTeam = yield team.getTeamByUrl(req.params.teamId);

  console.log(currTeam);

  res.render(`dynamic/team/team-detail`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      team: currTeam,
      title: currTeam.name
    });
}).catch(next));

module.exports = router;