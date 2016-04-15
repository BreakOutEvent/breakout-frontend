'use strict';

const mongoose = requireLocal('controller/mongo');
const renderer = requireLocal('services/renderer');
const fileSystem = requireLocal('services/file-system');
const express = require('express');
const Page = mongoose.model('page', requireLocal('schemas/page.js'));
const team = requireLocal('controller/page-controller/team');
const co = require('co');

module.exports.prerendered = (req, res, next) => {
  const fullFilePath = fileSystem
    .buildRenderedFilePath(req.params.language, req.params.path + '.html');
  if (fileSystem.exists(fullFilePath))
    res.sendFile(fullFilePath);
  else
    next();
};

module.exports.live = (req, res, next) => co(function*() {
  const page = yield renderer.renderPageByURL(req.params.language, req.params.path);
  if (page) {
    return res.send(page);
  }
  next();
}).catch(ex => next(ex.stack));
