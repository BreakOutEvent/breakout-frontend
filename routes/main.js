/**
 * Router for /
 */
'use strict';

var renderer = require('../controller/renderProxy.js');
var renderCache = require('../controller/renderCache.js');

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
  renderer.renderPage("56c897d0d0c4c4fc3b281320");
  res.send("DAN");
});

router.get('/:language([a-zA-Z]{2})/:path', function (req, res, next) {
  const fullFilePath = req.params.path + '.html';
  if(renderCache.exists(req.params.language, fullFilePath))
    res.sendFile(renderCache.buildFilePath(req.params.language, fullFilePath));
  else
    next();
});

module.exports = router;