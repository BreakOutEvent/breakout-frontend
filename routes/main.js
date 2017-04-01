'use strict';

/**
 * Router for /
 */
const Router = require('co-router');
const session = require('../controller/session');
const index = require('../controller/page-controller/index');

const router = new Router();

router.get('/logs/:log(error|info)', session.isAdmin, index.showLogs);

module.exports = router;
