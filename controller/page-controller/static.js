'use strict';

const renderer = requireLocal('services/renderer');
const fileSystem = requireLocal('services/file-system');
const team = requireLocal('controller/page-controller/team');
const co = require('co');
const fs = require('co-fs-extra');

module.exports.live = (language, path, res, next) => co(function*() {
  // We don't have to catch anything here, if page is null (can happen, mongo returns null instead
  // of throwing if nothing was found) we enter the .catch-block at the end of our co-block here.
  res.send(yield renderer.renderPageByURL(language, path));
}).catch(ex => next(ex));

module.exports.prerendered = (language, path, res, next) => co(function*() {
  // Here we "catch" non-existent files to avoid 500 error codes when we really have a 404.
  const fullFilePath = fileSystem.buildRenderedPath(language, path);
  if (yield fs.exists(fullFilePath)) {
    res.sendFile(fullFilePath);
  } else {
    next();
  }

}).catch(ex => next(ex));
