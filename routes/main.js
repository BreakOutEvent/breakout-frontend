'use strict';

/**
 * Router for /
 */
const execa = require('execa');
const a2h = require('ansi2html-extended');
const session = requireLocal('controller/session');

const Router = require('co-router');
const router = new Router();

/**
 * Endpoint for live log output.
 */
// TODO: This needs refactoring!
router.get('/logs/:log(error|info)', session.isAdmin, function *(req, res) {
  var cmd = 'npm run bunyan -s logs/' + req.params.log + '.log';

  const result = yield execa.shell(cmd);

  res.render('static/logs', {
    defaultLayout: false,
    content: a2h.fromString({
      standalone: false,
      escapeHtml: true
    }, result.stdout)
  });
});

module.exports = router;
