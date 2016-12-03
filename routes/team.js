'use strict';

/**
 * Routes for all team related requests
 */

const Router = require('co-router');
const multer = require('multer');
const TeamController = require('../controller/page-controller/TeamController');

const team = require('../controller/page-controller/team');
const session = require('../controller/session');

const router = new Router();
const upload = multer({inMemory: true});

router.get('/', TeamController.showTeamOverview);

router.get('/:teamId', TeamController.showTeamById);

router.get('/likes/:postingId', team.getLikes);

router.post('/post/create', session.hasTeam, upload.single('postPic'), team.createPost);

router.post('/comment/create', session.isUser, team.createComment);

router.post('/like', session.isUser, team.createLike);

router.post('/authenticated', team.isAuth);

router.delete('/posting/:postingId', session.isAdmin, team.deletePosting);

router.delete('/media/:mediaId', session.isAdmin, team.deleteMedia);

router.delete('/comment/:commentId', session.isAdmin, team.deleteComment);

module.exports = router;