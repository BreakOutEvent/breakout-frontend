/**
 * Router for /
 */
'use strict';

const express = require('express');
const co = require('co');
const teamController = requireLocal('controller/page-controller/team');
const staticController = requireLocal('controller/page-controller/static');
const renderer = requireLocal('services/renderer');
const execa = require('execa');
const a2h = require('ansi2html-extended');
const session = requireLocal('controller/session');

const router = express.Router();

router.get('/logs/:log(error|info)', session.isAdmin, (req, res, next) => co(function*() {
  var cmd = 'npm run bunyan -s logs/' + req.params.log + '.log';

  const result = yield execa.shell(cmd);

  res.render('templates/logs', {
    defaultLayout: false,
    content: a2h.fromString({
      standalone: false,
      escapeHtml: true
    }, result.stdout)
  });

}).catch(ex => {
  next(ex);
}));

router.get('/:language([a-zA-Z]{2})/team', (req, res, next) => co(function*() {
  teamController.teamPage(req.params.language, res);
}).catch(ex => next(ex)));

router.get('/:language([a-zA-Z]{2})/:path', (req, res, next) => co(function*() {
  staticController.prerendered(req.params.language, req.params.path, res, next);
}).catch(ex => next(ex)));

router.get('/live/:language([a-zA-Z]{2})/:path', (req, res, next) => co(function*() {
  staticController.live(req.params.language, req.params.path, res, next);
}).catch(ex => next(ex)));

module.exports = router;
