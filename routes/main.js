/**
 * Router for /
 */
'use strict';

const express = require('express');
const teamController = requireLocal('controller/page-controller/team');
const staticController = requireLocal('controller/page-controller/static');

const router = express.Router();

router.get('/:language([a-zA-Z]{2})/team', teamController);

router.get('/:language([a-zA-Z]{2})/:path', staticController.prerendered);

router.get('/live/:language([a-zA-Z]{2})/:path', staticController.live);

module.exports = router;
