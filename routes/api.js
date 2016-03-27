'use strict';

const mongoose = require('../controller/mongo.js');
const fs = require('fs');
const path = require('path');
const renderer = require('../controller/renderer');
const fileSystem = require('../controller/fileSystem');

const models = {
  view: mongoose.model('view', require('../schemas/view.js')),
  page: mongoose.model('page', require('../schemas/page.js')),
  menu: mongoose.model('menu', require('../schemas/menu.js')),
};

const express = require('express');
const reader = require('../controller/templateReader.js');
var router = express.Router();

// Creates regex string for filtering valid models
const allowedModels = '(' + Object.keys(models).reduce((p, k) => p + '|' + k, '').substr(1) + ')';

/*
 router.use((req, res, next) => {
 if (req.isAuthenticated()) next();
 else res.sendStatus(403);
 });*/

router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  });
  next();
});

/**
 * Reads a file path originating from / and sends it to the response
 * @param fpath Path to the file
 * @param res The HTTP response object
 */
function serveFile(fpath, res) {
  fs.access(fpath, fs.R_OK, err => err !== null ? res.send(err) : res.sendFile(fpath));
}

router.get('/getList', (req, res) =>
  reader.getAll(
    templates => res.json(templates)
  )
);

router.get('/css', (req, res) =>
  serveFile(path.join(global.ROOT, 'public/css/temp_style.min.css'), res)
);

router.get('/html/:name', (req, res) =>
  req.params.name === 'master' ?
    serveFile(fileSystem.buildTemplateFilePath('', 'master'), res) :
    serveFile(fileSystem.buildTemplateFilePath('partials', req.params.name), res)
);

router.get('/:model' + allowedModels, (req, res) =>
  models[req.params.model].find({}).exec((err, docs) =>
    err ? res.send(err) : res.json(docs)
  )
);

router.get('/:model' + allowedModels + '/:id', (req, res) =>
  models[req.params.model].findOne({ _id: req.params.id }).exec((err, docs) =>
    err ? res.send(err) : res.json(docs)
  )
);

router.get('/render/:pageid', (req, res) => {
  renderer.renderAndSavePage(req.params.pageid);
  res.json({
    status: 'ok',
  });
});

// Specific override for POST /api/view
router.post('/view', (req, res) => {
  if (!req.body || !req.body.name) {
    res.sendStatus(400);
    return;
  }

  reader.getByName(req.body.name, template => {
    if (!template) {
      res.sendStatus(404);
    }

    const rawView = {
      templateName: template.name,
      variables: [],
    };

    //FILL WITH DEFAULT VALUES
    for (let variable of template.variables) {
      variable.values = [
        { language: 'de', value: 'defaultValue' },
        { language: 'en', value: 'defaultValue' },
      ];
      rawView.variables.push(variable);
    }

    models.view.create(rawView, (err, docs) => {
      console.log(docs);
      if (err) {
        console.log(req.body);
        res.send(err);
      } else {
        res.json(docs);
      }
    });
  });
});

router.post('/:model' + allowedModels, (req, res) => {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model].create(req.body, (err, docs) => {
    if (err) {
      console.log(req.body);
      res.send(err);
    } else {
      res.json(docs);
    }
  });

});

router.post('/:model' + allowedModels + '/:id', (req, res) => {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model]
    .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, doc) => {
      if (err) {
        res.send(err);
      } else {
        res.json(doc);
      }
    });
});

router.delete('/:model' + allowedModels + '/:id', (req, res) => {
  models[req.params.model].findOneAndRemove({ _id: req.params.id }, (err, doc) => {
    if (err) {
      res.send(err);
    } else {
      res.json(doc);
    }
  });
});

module.exports = router;
