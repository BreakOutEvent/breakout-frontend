'use strict';

const config = {
  cluster: process.env.FRONTEND_CLUSTER !== undefined,
};

// Should start the server clustered (# of cores by default) if FRONTEND_CLUSTER is defined
const throng = config.cluster ? require('throng') : cb => cb(0);

throng(id => {
  const express = require('express');
  const mongoose = require('./controller/mongo.js');
  mongoose.con();
  const exphbs = require('express-handlebars');
  const path = require('path');
  const passport = require('./controller/auth.js');
  const bodyparser = require('body-parser');

  var app = express();
  var hbs = exphbs.create();

  global.ROOT = path.resolve(__dirname);

  require('enum').register();

  // handlebars is now default engine
  app.engine('.handlebars', hbs.engine);
  app.set('view engine', '.handlebars');

  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', path.join(__dirname, 'templates'));

  // Use application-level middleware for common functionality, including
  // logging, parsing, and session handling.
  app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(bodyparser.urlencoded({
    extended: true,
  }));
  app.use(bodyparser.json());
  app.use(require('cookie-parser')());
  app.use(require('connect-flash')());

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  // Sets routes
  app.use('/', require('./routes/main'));
  app.use('/admin', require('./routes/admin'));
  app.use('/api', require('./routes/api'));

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
  });

  app.use(function (req, res) {
    res.status(404);
    res.render('error', {
      code: 404,
      message: req.url + ' could not be found on this server',
    });
  });

  // Displays any errors
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
});
