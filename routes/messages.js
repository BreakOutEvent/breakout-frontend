'use strict';

/**
 * Routes for all messages related requests
 */
const Router = require('co-router');

const messages = requireLocal('controller/page-controller/messages');
const session = requireLocal('controller/session');

const router = new Router();

router.get('/:messageId?', session.isUser, messages.getById);

router.post('/search/:string', messages.searchUser);

router.post('/new', messages.createNew);

router.post('/send/:id', messages.send);


module.exports = router;
