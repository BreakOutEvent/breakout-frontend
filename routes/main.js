/**
 * Router for /
 */
'use strict';

const mongoose = requireLocal('controller/mongo');
const renderer = requireLocal('services/renderer');
const fileSystem = requireLocal('services/file-system');
const express = require('express');
const Page = mongoose.model('page', requireLocal('schemas/page.js'));
const Promise = require('bluebird');
const GoogleSpreadsheet = require('google-spreadsheet');
const co = require('co');
const _ = require('lodash');

const router = express.Router();

const config = {
  doc_id: process.env.FRONTEND_GDRIVE_DOCUMENT_ID,
  client_email: process.env.FRONTEND_GDRIVE_CLIENT_EMAIL,
  private_key: process.env.FRONTEND_GDRIVE_PRIVATE_KEY
};

Object.keys(config).forEach((k, val) => {
  if (!config[k]) {
    throw new Error(`No config entry found for ${k}`);
  }
});

router.get('/de/team', (req, res) => {
  const doc = new GoogleSpreadsheet(config.doc_id);
  var credsJson = {
    client_email: config.client_email,
    private_key: config.private_key.replace(/\\n/g, '\n')
  };

  co(function* () {
    yield Promise.promisify(doc.useServiceAccountAuth)(credsJson);

    const info = yield Promise.promisify(doc.getInfo)();
    const sheet = info.worksheets[0];

    const rows = yield Promise.promisify(sheet.getRows)({
      offset: 1,
      orderby: 'name'
    });

    const vars = rows.reduce((init, curr) => _.concat(init, {
      name: curr.name,
      url: curr.link,
      role: curr.role
    }));

    res.render('static/team/content', {
      layout: 'master',
      member: vars,
      language: 'de'
    });

  }).catch(ex => console.error(ex.stack));
});

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
