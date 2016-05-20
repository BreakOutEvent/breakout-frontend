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
  //const currTeam = yield team.getTeamByUrl(req.params.teamId);

  let currTeam = {
    id: 1,
    name: 'Erstes Team',
    event: {
      id: 1,
      title: 'Breakout München 2016',
      date: 1464912000,
      city: 'München',
      startingLocation: {latitude: 48.13743, longitude: 11.57549},
      duration: 36
    },
    description: 'Geile Sache',
    members: [
      {
        firstname: 'Keno',
        lastname: 'Dreßel',
        id: 1,
        participant: [Object],
        profilePic: [Object],
        roles: [Object],
        blocked: true
      },
      {
        firstname: 'TEST',
        lastname: 'TEST',
        id: 1,
        participant: [Object],
        profilePic: [Object],
        roles: [Object],
        blocked: true
      }],
    profilePic: {id: 21, type: 'IMAGE', uploadToken: null, sizes: []},
    invoiceId: 1
  };

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