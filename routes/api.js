/**
 * Router for /
 */
'use strict';

var mongoose = require('../controller/mongo.js');
var fs = require('fs');

var models = {
  "view": mongoose.model('view', require('../schemas/view.js')),
  "page": mongoose.model('page', require('../schemas/page.js'))
};

var express = require('express');
var reader = require('../controller/templateReader.js');
var router = express.Router();

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/getList', function(req, res) {
  reader.getAll(function(templates) {
    res.json(templates);
  });
});

router.get('/css', function (req, res) {
  fs.readFile('public/css/temp_style.min.css', function(err, file) {
    if(err) {
      res.send(err);
      return;
    }
    res.send(file);
  });
});

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


router.post('/batch/:model', function(req, res) {

  var model = models[req.params.model] ? models[req.params.model] : null;

  if (!model) {
    res.sendStatus(404);
    return;
  }

  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  models[req.params.model].find({ _id : { $in : req.body } }).exec(function (err, docs) {
    if (err) {
      res.send(err);
    } else {
      res.json(docs);
    }
  });
});

//OVERWRITE
router.post('/view', function(req, res) {

  if (!req.body || !req.body.name) {
    res.sendStatus(400);
    return;
  }

  reader.getByName(req.body.name, function(template) {
    if(!template) {
      res.sendStatus(404);
    }

    console.log(template);

    var rawView = {};
    rawView.templateName = template.name;
    rawView.variables = [];

    //FILL WITH DEFAULT VALUES
    template.variables.forEach(function(variable) {
      variable.values = [
        {language:'de', value:'defaultValue'},
        {language:'en', value:'defaultValue'}
      ];
      rawView.variables.push(variable);
    });

    console.log(rawView);

    models["view"].create(rawView, function (err, docs) {
      if (err) {
        console.log(req.body);
        res.send(err);
      } else {
        res.json(docs);
      }
    });

  });



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

  /*if (req.params.model === 'template') {
    res.sendStatus(403);
    return;
  }*/

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

router.post('/:model/:id', function (req, res) {

  var model = models[req.params.model] ? models[req.params.model] : null;

  if (!model) {
    res.sendStatus(404);
    return;
  }

  /*if (req.params.model === 'template') {
    res.sendStatus(403);
    return;
  }*/

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

  /*if (req.params.model === 'template') {
    res.sendStatus(403);
    return;
  }*/

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