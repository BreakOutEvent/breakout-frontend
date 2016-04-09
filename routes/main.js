/**
 * Router for /
 */
'use strict';

const mongoose = requireLocal('controller/mongo');
const renderer = requireLocal('services/renderer');
const fileSystem = requireLocal('services/file-system');
const express = require('express');
const Page = mongoose.model('page', requireLocal('schemas/page.js'));

var router = express.Router();

router.get('/:language([a-zA-Z]{2})/:path', (req, res, next) => {
  const fullFilePath = fileSystem
    .buildRenderedFilePath(req.params.language, req.params.path + '.html');
  if (fileSystem.exists(fullFilePath))
    res.sendFile(fullFilePath);
  else
    next();
});

router.get('/live/:language([a-zA-Z]{2})/:path', (req, res, next) => {
  Page
    .where('properties.url')
    .equals(req.params.path)
    .where('properties.language')
    .equals(req.params.language)
    .exec(function (err, docs) {
      if (err) {
        next(err);
      } else if (docs.length > 0) {
        renderer.renderPage(docs[0]._id, (html, language) =>
          language === req.params.language && res.send(html)
        );
      } else {
        next();
      }
    });

});

module.exports = router;
