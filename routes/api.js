'use strict';
const mongoose = requireLocal('controller/mongo.js');
const fs = require('co-fs-extra');
const co = require('co');
const path = require('path');
const renderer = requireLocal('services/renderer');
const fileSystem = requireLocal('services/file-system');
const multer = require('multer');
const adminAuth = requireLocal('controller/admin-auth');
const api = requireLocal('controller/api-proxy');
const _ = require('lodash');

const express = require('express');
const reader = requireLocal('services/template-reader.js');
const router = express.Router();

const models = {
  view: mongoose.model('view', requireLocal('schemas/view.js')),
  page: mongoose.model('page', requireLocal('schemas/page.js')),
  menu: mongoose.model('menu', requireLocal('schemas/menu.js'))
};

// Creates regex string for filtering valid models
const allowedModels = '(' + Object.keys(models).reduce((p, k) => p + '|' + k, '').substr(1) + ')';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/img/uploads');
  },

  filename: (req, file, callback) => {
    const fn = file.originalname;
    callback(null, fn + '-' + Date.now() + path.extname(fn));
  }
});
const upload = multer({ storage: storage }).single('image');

router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  });
  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

router.post('/auth/login', function (req, res) {
  api.authenticate(req.body.email, req.body.password)
    .then(() => {
      res.send({ token: adminAuth.createJWT(req.body.email) });
    })
    .catch((ex) => {
      console.error(ex.stack);
      res.status(401).send({ message: 'Invalid email and/or password' });
    });
});

router.use(adminAuth.ensureAuthenticated);

/**
 * Reads a file path originating from / and sends it to the response
 * @param fpath Path to the file
 * @param res The HTTP response object
 */
const serveFile = (fpath, res) => co(function*() {
  yield fs.exists(fpath);
  res.sendFile(fpath);
}).catch(ex => {
  throw ex;
});

router.post('/image', upload, (req, res) =>
  res.json({
    filePath: '/img/uploads/' + req.file.filename
  })
);

router.delete('/image/:filename', (req, res, next) => co(function*() {
  yield fs.unlink('./public/img/uploads/' + req.params.filename);
  res.json({
    result: 'ok'
  });
}).catch(ex => next(ex)));

router.get('/images', (req, res, next) => co(function*() {
  const list = _.remove(yield fs.readdir(ROOT + '/public/img/uploads'), e => e !== 'empty');
  res.json({
    images: list
  });
}).catch(ex => next(ex)));

router.get('/getList', (req, res) =>
  res.json(reader.getAll())
);

router.get('/css', (req, res, next) => co(function*() {
  yield serveFile(path.join(global.ROOT, 'public/css/styles.min.css'), res);
}).catch(ex => next(ex)));

router.get('/html/:name', (req, res, next) => co(function*() {
  req.params.name === 'master' ?
    yield serveFile(fileSystem.buildMasterTemplatePath(), res) :
    yield serveFile(fileSystem.buildTemplatePath(req.params.name), res);
}));

router.get('/:model' + allowedModels, (req, res, next) =>
  models[req.params.model].find({}).exec((err, docs) =>
    err ? next(err) : res.json(docs)
  )
);

router.get('/:model' + allowedModels + '/:id', (req, res, next) =>
  models[req.params.model].findOne({ _id: req.params.id }).exec((err, docs) =>
    err ? next(err) : res.json(docs)
  )
);

router.get('/render/:pageid', (req, res) => {
  renderer.renderAndSavePageByID(req.params.pageid);
  res.json({
    status: 'ok'
  });
});

// Specific override for POST /api/view
router.post('/view', (req, res, next) => {
  if (!req.body || !req.body.name) {
    return res.sendStatus(400);
  }

  const template = reader.getByName(req.body.name);
  if (!template) {
    return res.sendStatus(404);
  }

  const rawView = {
    templateName: template.name,
    variables: []
  };

  //FILL WITH DEFAULT VALUES
  for (let variable of template.variables) {
    variable.values = [
      { language: 'de', value: 'defaultValue' },
      { language: 'en', value: 'defaultValue' }
    ];
    rawView.variables.push(variable);
  }

  models.view.create(rawView, (err, docs) => {
    console.log(docs);
    if (err) {
      next(err);
    } else {
      res.json(docs);
    }
  });
});

router.post('/:model' + allowedModels, (req, res, next) => {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model].create(req.body, (err, docs) => {
    if (err) {
      next(err);
    } else {
      res.json(docs);
    }
  });

});

router.post('/:model' + allowedModels + '/:id', (req, res, next) => {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model]
    .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, doc) => {
      if (err) {
        next(err);
      } else {
        res.json(doc);
      }
    });
});

router.delete('/:model' + allowedModels + '/:id', (req, res, next) => {
  models[req.params.model].findOneAndRemove({ _id: req.params.id }, (err, doc) => {
    if (err) {
      next(err);
    } else {
      res.json(doc);
    }
  });
});

module.exports = router;
