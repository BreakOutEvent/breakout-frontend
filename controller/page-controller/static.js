'use strict';

const mongoose = requireLocal('controller/mongo');
const renderer = requireLocal('services/renderer');
const fileSystem = requireLocal('services/file-system');
const express = require('express');
const Page = mongoose.model('page', requireLocal('schemas/page.js'));
const team = requireLocal('controller/page-controller/team');

const router = express.Router();

module.exports.prerendered = (req, res, next) => {
  const fullFilePath = fileSystem
    .buildRenderedFilePath(req.params.language, req.params.path + '.html');
  if (fileSystem.exists(fullFilePath))
    res.sendFile(fullFilePath);
  else
    next();
};

module.exports.live = (req, res, next) => {
  Page
    .where('properties.url')
    .equals(req.params.path)
    .where('properties.language')
    .equals(req.params.language)
    .exec((err, docs) => {
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
};
