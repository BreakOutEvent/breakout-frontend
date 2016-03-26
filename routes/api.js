/**
 * Router for /
 */
'use strict';

var mongoose = require('../controller/mongo.js');
var fs = require('fs');
var path = require('path');
var renderer = require('../controller/renderProxy');

var models = {
  "view": mongoose.model('view', require('../schemas/view.js')),
  "page": mongoose.model('page', require('../schemas/page.js')),
  "menu": mongoose.model('menu', require('../schemas/menu.js'))
};

var express = require('express');
var reader = require('../controller/templateReader.js');
var router = express.Router();

// Creates regex string for filtering valid models
const allowedModels = '(' + Object.keys(models).reduce((prev, key) => prev + '|' + key, "").substr(1) + ')';

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
 * Reads a file path originating from / and sends it to the response
 * @param template_file Path to the file
 * @param res The HTTP response object
 */
function serveFile(template_file, res) {
  const fpath = path.join(global.ROOT, template_file);
  fs.access(fpath, fs.R_OK, (err) => {
    err !== null ? res.send(err) : res.sendFile(fpath);
  });
}

router.get('/getList', function (req, res) {
  reader.getAll(function (templates) {
    res.json(templates);
  });
});

router.get('/css', function (req, res) {
  serveFile('public/css/temp_style.min.css', res);
});

router.get('/html/:name', function (req, res) {
  if (req.params.name === 'master') {
    serveFile('templates/master.handlebars', res);
  } else {
    serveFile(path.join('templates/partials/', req.params.name) + '.handlebars', res);
  }
});


router.post('/batch/:model' + allowedModels, function (req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model]
    .find({_id: {$in: req.body}})
    .exec(function (err, docs) {
      if (err) {
        res.send(err);
      } else {
        res.json(docs);
      }
    });
});

router.get('/:model' + allowedModels, function (req, res) {
  models[req.params.model].find({}).exec(function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.json(docs);
    }
  });
});

router.get('/:model' + allowedModels + '/:id', function (req, res) {
  models[req.params.model].findOne({'_id': req.params.id}).exec(function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.json(docs);
    }
  });
});

router.get('/render/:pageid', (req, res) => {
  renderer.renderAndSavePage(req.params.pageid);
  res.json({
    'status': 'ok'
  });
});

// Specific override for POST /api/view
router.post('/view', function (req, res) {
  if (!req.body || !req.body.templateName) {
    res.sendStatus(400);
    return;
  }

  reader.getByName(req.body.templateName, function (template) {
    if (!template) {
      res.sendStatus(404);
    }

    var rawView = {
      templateName: template.name,
      variables: []
    };

    //FILL WITH DEFAULT VALUES
    template.variables.forEach(function (variable) {
      variable.values = [
        {language: 'de', value: 'defaultValue'},
        {language: 'en', value: 'defaultValue'}
      ];
      rawView.variables.push(variable);
    });

    models["view"].create(rawView, function (err, docs) {
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

router.post('/:model' + allowedModels, function (req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model].create(req.body, function (err, docs) {
    if (err) {
      console.log(req.body);
      res.send(err);
    } else {
      res.json(docs);
    }
  });

});

router.put('/:model' + allowedModels + '/:id', function (req, res) {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model].findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, function (err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.json(doc);
    }
  });
});

router.delete('/:model' + allowedModels + '/:id', function (req, res) {
  models[req.params.model].findOneAndRemove({_id: req.params.id}, function (err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.json(doc);
    }
  });
});

module.exports = router;