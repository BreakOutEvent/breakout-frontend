'use strict';

const mongoose = requireLocal('controller/mongo.js');
const fs = require('fs');
const path = require('path');
const renderer = requireLocal('controller/renderer');
const fileSystem = requireLocal('controller/file-system');
const multer = require('multer');

const models = {
  view: mongoose.model('view', requireLocal('schemas/view.js')),
  page: mongoose.model('page', requireLocal('schemas/page.js')),
  menu: mongoose.model('menu', requireLocal('schemas/menu.js')),
};

const express = require('express');
const reader = requireLocal('controller/template-reader.js');
var router = express.Router();

// Creates regex string for filtering valid models
const allowedModels = '(' + Object.keys(models).reduce((p, k) => p + '|' + k, '').substr(1) + ')';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/img/uploads');
  },

  filename: (req, file, callback) => {
    const fn = file.originalname;
    callback(null, fn + '-' + Date.now() + path.extname(fn));
  },
});
const upload = multer({ storage: storage }).single('image');

router.use((req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.sendStatus(403);
});

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

router.post('/image', upload, (req, res) =>
  res.json({
    filePath: '/img/uploads/' + req.file.filename,
  })
);

router.delete('/image/:filename', (req, res) =>
  fs.unlink('./public/img/uploads/' + req.params.filename, (err) => {
    if (err) {
      res.status(404);
    } else {
      res.json({
        result: 'ok',
      });
    }
  })
);

router.get('/getList', (req, res) =>
  res.json(reader.getAll())
);

router.get('/css', (req, res) =>
  serveFile(path.join(global.ROOT, 'public/css/styles.min.css'), res)
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
    return res.sendStatus(400);
  }

  const template = reader.getByName(req.body.name);
  if (!template) {
    return res.sendStatus(404);
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
