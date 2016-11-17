'use strict';

/**
 * Router for /
 */

const express = require('express');
const co = require('co');
const execa = require('execa');
const a2h = require('ansi2html-extended');
const session = requireLocal('controller/session');

const router = express.Router();

/**
 * Endpoint for live log output.
 */
// TODO: This needs refactoring!
router.get('/logs/:log(error|info)', session.isAdmin, (req, res, next) => co(function*() {
  var cmd = 'npm run bunyan -s logs/' + req.params.log + '.log';

  const result = yield execa.shell(cmd);

  res.render('static/logs', {
    defaultLayout: false,
    content: a2h.fromString({
      standalone: false,
      escapeHtml: true
    }, result.stdout)
  });

}).catch(ex => {
  next(ex);
}));

module.exports = router;
