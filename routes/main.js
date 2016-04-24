/**
 * Router for /
 */
'use strict';

const express = require('express');
const co = require('co');
const teamController = requireLocal('controller/page-controller/team');
const staticController = requireLocal('controller/page-controller/static');
const renderer = requireLocal('services/renderer');

const router = express.Router();

router.get('/:language([a-zA-Z]{2})/team', (req, res, next) => co(function* () {
  teamController.teamPage(req.params.language, res);
}).catch(ex => next(ex)));

router.get('/:language([a-zA-Z]{2})/:path', (req, res, next) => co(function* () {
  staticController.prerendered(req.params.language, req.params.path, res, next);
}).catch(ex => next(ex)));

router.get('/live/:language([a-zA-Z]{2})/:path', (req, res, next) => co(function* () {
  staticController.live(req.params.language, req.params.path, res, next);
}).catch(ex => next(ex)));

router.get('/live/test', (req, res, next) => co(function*() {
  res.send('Ostern is');
}).catch(ex => next(ex)));

module.exports = router;
