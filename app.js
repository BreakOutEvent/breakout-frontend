'use strict';

const config = {
  cluster: process.env.FRONTEND_CLUSTER !== undefined,
};

// Should start the server clustered (# of cores by default) if FRONTEND_CLUSTER is defined
const throng = config.cluster ? require('throng') : cb => cb(0);

throng(id => {
  const path = require('path');
  global.ROOT = path.resolve(__dirname);

  global.requireLocal = module => require(__dirname + '/' + module);

  const express = require('express');
  const exphbs = require('express-handlebars');
  const bodyparser = require('body-parser');
  require('enum').register();

  requireLocal('controller/mongo.js').con();
  const passport = requireLocal('controller/auth.js');

  const app = express();

  // Handlebars setup
  const hbs = exphbs.create({
      helpers: requireLocal('services/helpers'),
      partialsDir: path.join('views/partials')
    }
  );

  global.HBS = hbs;

  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');

  app.use(express.static(path.join(__dirname, 'public')));

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
  app.use('/', requireLocal('routes/main'));
  app.use('/admin', requireLocal('routes/admin/admin'));
  app.use('/admin/api', requireLocal('routes/admin/api'));

  var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
  });

  app.use(function(req, res) {
    res.status(404);
    res.render('error', {
      code: 404,
      message: req.url + ' could not be found on this server',
    });
  });

  // Displays any errors
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
});
