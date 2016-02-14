/**
 * Router for /
 */
'use strict';

var mongoose = require('../controller/mongo.js');
var fs = require('fs');

var models = {
  "template": mongoose.model('template', require('../schemas/template.js')),
  "view": mongoose.model('view', require('../schemas/view.js')),
  "page": mongoose.model('page', require('../schemas/page.js')),
  "variable": mongoose.model('variable', require('../schemas/variable.js'))
};

var express = require('express');
var router = express.Router();

router.get('/html/:name', function (req, res) {

  if (!req.params.name) {
    res.sendStatus(400);
    return;
  }

  if(req.params.name === 'master') {
    fs.readFile('templates/master.handlebars', function(err, file) {
      if(err) {
        res.send(err);
        return;
      }
      res.send(file);
    });
  } else {
    fs.readFile('templates/partials/' + req.params.name +'.handlebars', function(err, file) {
      if(err) {
        res.send(err);
        return;
      }
      res.send(file);
    });
  }
});



router.get('/:model', function (req, res) {

  var model = models[req.params.model] ? models[req.params.model] : null;

  if (!model) {
    res.sendStatus(404);
    return;
  }

  models[req.params.model].find({}).exec(function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.json(docs);
    }
  });

});

router.get('/:model/:id', function (req, res) {

  var model = models[req.params.model] ? models[req.params.model] : null;

  if (!model) {
    res.sendStatus(404);
    return;
  }

  if (!req.params.id) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model].findOne({'_id':req.params.id}).exec(function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.json(docs);
    }
  });

});

router.post('/:model', function (req, res) {

  var model = models[req.params.model] ? models[req.params.model] : null;

  if (!model) {
    res.sendStatus(404);
    return;
  }

  if (req.params.model === 'template') {
    res.sendStatus(403);
    return;
  }

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

router.put('/:model/:id', function (req, res) {

  var model = models[req.params.model] ? models[req.params.model] : null;

  if (!model) {
    res.sendStatus(404);
    return;
  }

  if (req.params.model === 'template') {
    res.sendStatus(403);
    return;
  }

  if (!req.body || !req.params.id) {
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

router.delete('/:model/:id', function (req, res) {

  var model = models[req.params.model] ? models[req.params.model] : null;

  if (!model) {
    res.sendStatus(404);
    return;
  }

  if (req.params.model === 'template') {
    res.sendStatus(403);
    return;
  }

  if (!req.params.id) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model].findOneAndRemove({_id: req.params.id}, function (err, doc) {
    if (err) {
      res.send(err);
    } else {
      res.json(doc);
    }
  });

});

module.exports = router;