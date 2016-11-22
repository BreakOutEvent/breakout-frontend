'use strict';

/**
 * Routes for all team related requests
 */

const Router = require('co-router');
const multer = require('multer');
const _ = require('lodash');

const team = requireLocal('controller/page-controller/team');
const session = requireLocal('controller/session');

const router = new Router();
const upload = multer({inMemory: true});


router.get('/', function* (req, res) {

  const allTeams = yield team.getAll();
  const searchData = allTeams.map(t => {
    let members = t.members.map(m => {
      return {
        firstname: m.firstname,
        lastname: m.lastname
      };
    });
    return {
      name: t.name,
      id: t.id,
      members: members
    };
  });

  res.render('dynamic/team/team-overview', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    teams: allTeams,
    searchData: searchData,
    isLoggedIn: req.user,
    title: 'Team Übersicht'
  });
});

router.get('/:teamId', function* (req, res) {

  let teamId = parseInt(req.params.teamId);

  if (teamId === 103) {
    res.status(404);
    return res.render('error', {
      code: 404,
      message: `Team ${req.params.teamId} could not be found on this server`
    });
  }

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
  let isUserAdmin = false;

  if (req.user && req.user.me) {
    currentUser = req.user.me;
    isUserOfTeam = _.findIndex(currTeam.members, m => m.id == currentUser.id) > -1;
    isUserAdmin = _.findIndex(req.user.me.roles, r => r === 'ADMIN') > -1;
  }

  res.render('dynamic/team/team-detail', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    team: currTeam,
    user: currentUser,
    isUserOfTeam: isUserOfTeam,
    isUserAdmin: isUserAdmin,
    isLoggedIn: req.user,
    title: currTeam.name
  });
});

router.post('/post/create', session.hasTeam, upload.single('postPic'), team.createPost);
router.post('/comment/create', session.isUser, team.createComment);
router.post('/like', session.isUser, team.createLike);
router.get('/likes/:postingId', team.getLikes);
router.post('/authenticated', team.isAuth);

router.delete('/posting/:postingId', session.isAdmin, team.deletePosting);
router.delete('/media/:mediaId', session.isAdmin, team.deleteMedia);
router.delete('/comment/:commentId', session.isAdmin, team.deleteComment);

module.exports = router;