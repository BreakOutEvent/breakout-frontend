'use strict';

/**
 * Routes for all hashtag related requests
 */
const Router = require('co-router');
const posting = require('../controller/PostingController');

const router = new Router();

router.get('/hashtag/:hashtag', posting.getByHashtag);

router.get('/:postingId', posting.getById);

module.exports = router;