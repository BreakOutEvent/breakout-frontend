'use strict';

/**
 * Router for /
 */
const Router = require('co-router');
const session = require('../controller/session');
const index = require('../controller/page-controller/index');

const router = new Router();

router.get('/logs/:log(error|info)', session.isAdmin, index.showLogs);
router.get('/client-config', (req, res) => {
  res.send({
    clientId: process.env.REACT_CLIENT_ID,
    // TODO: This not really a secret because we
    // need to store it on the client anyway.
    // Needs adaptation of oauth flow
    clientSecret: process.env.REACT_CLIENT_SECRET,
    baseUrl: process.env.REACT_BASEURL
  });
});

module.exports = router;
