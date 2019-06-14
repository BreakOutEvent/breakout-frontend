'use strict';

/**
 * Routes for all hashtag related requests
 */
const Router = require('co-router');
const challenges = require('../controller/ChallengeController');

const router = new Router();

router.get('/:challengeId', challenges.getPostingsById);

module.exports = router;
