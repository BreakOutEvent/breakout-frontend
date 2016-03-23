/**
 * Router for /
 */
'use strict';

var mongoose = require('../controller/mongo.js');
var renderer = require('../controller/renderProxy.js');
var renderCache = require('../controller/renderCache.js');

var express = require('express');
var router = express.Router();
var Page = mongoose.model('page', require('../schemas/page.js'));


router.get('/', function (req, res) {
  renderer.renderAndSavePage("56c897d0d0c4c4fc3b281320");
  res.send("DAN");
});

router.get('/:language([a-zA-Z]{2})/:path', function (req, res, next) {
  const fullFilePath = req.params.path + '.html';
  if (renderCache.exists(req.params.language, fullFilePath))
    res.sendFile(renderCache.buildFilePath(req.params.language, fullFilePath));
  else
    next();
});

router.get('/live/:language([a-zA-Z]{2})/:path', function (req, res, next) {
  Page
    .where('properties.url')
    .equals(req.params.path)
    .where('properties.language')
    .equals(req.params.language)
    .exec(function (err, docs) {
      if (err) {
        next(err);
      }
      else if (docs.length > 0) {
        renderer.renderPage(docs[0]._id, function (html, language) {
          if (language === req.params.language)
            res.send(html);
        });
      }
      else{
        next();
      }
    });

});

module.exports = router;