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

const upload = multer({ inMemory: true });
const router = express.Router();


router.get('/', (req, res, next) => co(function*() {

  const allTeams = yield team.getAll();
  const searchData = allTeams.map(t => {
    let members = t.members.map(m => {
      return {
        firstname: m.firstname,
        lastname: m.lastname
      }
    });
    return {
      name: t.name,
      id: t.id,
      members: members
    }
  });

  res.render(`dynamic/team/team-overview`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      teams: allTeams,
      searchData: searchData,
      isLoggedIn: req.user,
      title: 'Team Übersicht'
    });


}).catch(next));

router.get('/:teamId', (req, res, next) => co(function*() {
  const currTeam = yield team.getTeamByUrl(req.params.teamId, req.user);


  if (!currTeam.hasFullyPaid) {
    res.status(404);
    return res.render('error', {
      code: 404,
      message: `Team ${req.params.teamId} could not be found on this server`
    });
  }

  let currentUser = null;
  let isUserOfTeam = false;

  if (req.user && req.user.me) {
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
      isLoggedIn: req.user,
      title: currTeam.name
    });
}).catch(next));

router.post('/post/create', session.hasTeam, upload.single('postPic'), team.createPost);
router.post('/comment/create', session.isUser, team.createComment);
router.post('/like', session.isUser, team.createLike);
router.get('/likes/:postingId', team.getLikes);
router.post('/authenticated', team.isAuth);

module.exports = router;