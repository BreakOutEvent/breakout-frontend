/**
 * Router for /
 */
'use strict';

var mongoose = require('../controller/mongo.js');
var renderer = require('../controller/renderProxy.js');

var express = require('express');
var router = express.Router();


router.get('/', function (req, res) {
  renderer.renderPage("56c897d0d0c4c4fc3b281320");
  res.send("DAN");
});

router.get('/:language([a-zA-Z]{2})/:path', function(req, res){
  res.send(req.params.language + "/" + req.params.path);
});

module.exports = router;