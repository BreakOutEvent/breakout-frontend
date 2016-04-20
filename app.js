'use strict';

const DEFAULT_SECRET = 'keyboard cat';
const config = {
  cluster: process.env.FRONTEND_CLUSTER === 'true',
  secret: process.env.FRONTEND_SECRET || DEFAULT_SECRET
};

// Should start the server clustered (# of cores by default) if FRONTEND_CLUSTER is defined
const throng = config.cluster ? require('throng') : cb => cb(0);

throng(id => {
  const path = require('path');
  global.ROOT = path.resolve(__dirname);

  global.requireLocal = module => require(__dirname + '/' + module);

  const express = require('express');
  const app = express();

  const exphbs = require('express-handlebars');
  const bodyparser = require('body-parser');
  const morgan = require('morgan');
  const fs = require('fs');

  const bunyan = require('bunyan');
  global.logger = bunyan.createLogger(
    {
      name: 'breakout-frontend',
      streams: [
        {
          level: 'info',
          stream: fs.createWriteStream(ROOT + '/logs/info.log', { flags: 'a' })
        },
        {
          level: 'error',
          stream: fs.createWriteStream(ROOT + '/logs/error.log', { flags: 'a' })
        }
      ],
      serializers: bunyan.stdSerializers,
      src: process.env.NODE_ENV === 'development'
    }
  );

  app.use(morgan('combined',
    { stream: fs.createWriteStream(ROOT + '/logs/access.log', { flags: 'a' }) }
  ));

  logger.info('Trying', 10, 'something', {hello: 'world'}, 'out');

  requireLocal('controller/mongo.js').con();
  const passport = requireLocal('controller/auth.js');

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

  if (process.env.NODE_ENV === 'production' && config.secret === DEFAULT_SECRET) {
    throw new Error('No custom secret specified, please set one via FRONTEND_SECRET');
  }

  // Use application-level middleware for common functionality, including
  // logging, parsing, and session handling.
  app.use(require('express-session')({
    secret: config.secret,
    resave: false,
    saveUninitialized: false
  }));
  app.use(bodyparser.urlencoded({
    extended: true
  }));
  app.use(bodyparser.json());
  app.use(require('cookie-parser')());
  app.use(require('connect-flash')());

  //Set language header correctly including fallback option.
  app.use(requireLocal('services/i18n').init);

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  // Sets routes
  app.use('/', require('./routes/main'));
  app.use('/', require('./routes/dynamic'));
  app.use('/admin', require('./routes/admin/admin'));
  app.use('/api', require('./routes/admin/api'));

  var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;

    logger.info('Server listening on port ' + port);
    console.log('Listening at http://%s:%s', host, port);
  });

  app.use((req, res) => {
    res.status(404);
    res.render('error', {
      code: 404,
      message: req.url + ' could not be found on this server'
    });
  });

  // Displays any errors
  app.use((err, req, res) => {
    res.status(err.status || 500);

    logger.error(err);

    if (process.env.NODE_ENV === 'production') {
      res.render('error', {
        code: err.status,
        message: 'Internal Server error'
      });
    } else {
      res.render('error', {
        code: err.status,
        message: err.message,
        error: err
      });
    }
  });
});
