'use strict';

/**
 * Routes for all team related requests
 */

const Router = require('co-router');
const multer = require('multer');
const TeamController = require('../controller/TeamController');

const session = require('../controller/SessionController');

const router = new Router();
const upload = multer({inMemory: true});

router.get('/', TeamController.showTeamOverview);

router.get('/:teamId', TeamController.showTeamById);

router.get('/likes/:postingId', TeamController.getLikes);

router.post('/post/create', session.hasTeam, upload.single('postPic'), TeamController.createPost);

router.post('/comment/create', session.isUser, TeamController.createComment);

router.post('/like', session.isUser, TeamController.createLike);

router.post('/authenticated', TeamController.isAuth);

router.delete('/posting/:postingId', session.isAdmin, TeamController.deletePosting);

router.delete('/media/:mediaId', session.isAdmin, TeamController.deleteMedia);

router.delete('/comment/:commentId', session.isAdmin, TeamController.deleteComment);

module.exports = router;