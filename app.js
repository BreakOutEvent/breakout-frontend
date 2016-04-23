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
  const fs = require('fs');

  global.ROOT = path.resolve(__dirname);

  global.requireLocal = module => require(__dirname + '/' + module);

  const express = require('express');
  const app = express();

  app.use(express.static(path.join(__dirname, 'public')));

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
      src: process.env.NODE_ENV !== 'production'
    }
  );

  const morgan = require('morgan');
  app.use(morgan('combined',
    { stream: fs.createWriteStream(ROOT + '/logs/access.log', { flags: 'a' }) }
  ));

  const exphbs = require('express-handlebars');
  const bodyparser = require('body-parser');
  const co = require('co');

  const mongoose = requireLocal('controller/mongo.js').con();
  const passport = requireLocal('controller/auth.js');
  const API = requireLocal('controller/api-proxy');

  // Handlebars setup
  const hbs = exphbs.create({
      helpers: requireLocal('services/helpers'),
      partialsDir: path.join('views/partials')
    }
  );

  global.HBS = hbs;

  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');

  if (process.env.NODE_ENV === 'production' && config.secret === DEFAULT_SECRET) {
    throw new Error('No custom secret specified, please set one via FRONTEND_SECRET');
  }

  const session = require('express-session');
  const MongoStore = require('connect-mongo')(session);

  app.use(session({
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  }));

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(bodyparser.urlencoded({
    extended: true
  }));
  app.use(bodyparser.json());
  app.use(require('cookie-parser')());
  app.use(require('connect-flash')());

  //Set language header correctly including fallback option.
  app.use(requireLocal('services/i18n').init);

  app.use((req, res, next)=> co(function*() {
    if (req.isAuthenticated()
      && req.user.expires_at
      && new Date() > new Date(req.user.expires_at)
    ) {
      const refr = yield API.refresh(req.user);
      req.login(yield passport.createSession(req.user.email, refr), (error) => {
        if (error) throw error;
        next();
      });
    } else {
      next();
    }
  }).catch(ex => {
    logger.error(ex.stack);
    req.logout();
    req.flash('error', 'Something went wrong while refreshing your token. You were logged out.');
    res.redirect('/');
  }));

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
  app.use((err, req, res, next) => {
    logger.error(err);

    res.status(err.status || 500);

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
})
;
