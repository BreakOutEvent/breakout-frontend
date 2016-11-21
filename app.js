/*
 * The application entry point
 * Here all express middleware, routers, config, logging,
 * globals and socket.io will be loaded / initialized.
 */

'use strict';

global.requireLocal = module => require(__dirname + '/' + module);
global.IS_TEST = process.env.FRONTEND_RUN_TESTS === 'true';
global.ROOT = require('path').resolve(__dirname);

const co = require('co');
const config = require('./config/config');
const sticky = require('sticky-cluster');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const express = require('express');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const _ = require('lodash');
const socketio = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser')();
const connectFlash = require('connect-flash')();
const http = require('http');
const logger = require('./services/logger');

require('newrelic');

const mongoose = requireLocal('controller/mongo.js');
const passport = requireLocal('services/auth.js');
const API = requireLocal('services/api-proxy');
const websocket = requireLocal('services/websocket');

function setupLogger(app) {
  if (IS_TEST) return;
  app.use(morgan('combined', {stream: fs.createWriteStream(ROOT + '/logs/access.log', {flags: 'a'})}));
}

function genericErrorHandler(err, req, res) {

  logger.error(err);

  res.status(err.status || 500);

  if (process.env.NODE_ENVIRONMENT === 'dev' || process.env.SHOW_ERROR === 'true') {
    res.render('error', {
      code: err.status,
      message: err.message,
      error: err
    });
  } else {
    res.render('error', {
      code: err.status,
      message: 'Internal Server error'
    });
  }
}

function notFoundHandler(req, res) {
  res.status(404);
  res.render('error', {
    code: 404,
    message: req.url + ' could not be found on this server'
  });
}

function sessionHandler(req, res, next) {
  co(function*() {
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
  });
}


function checkForDuplicates(partialsDirs) {
// Read all files from the template directories and flatten them into one array
  const readDirs = partialsDirs
    .map(dir => fs.readdirSync(dir))
    .reduce((first, second) => first.concat(second));

  // If there are any duplicates in the list, they are different in length
  const uniqueFiles = _.uniq(_.filter(readDirs, v => _.filter(readDirs, v1 => v1 === v).length > 1));
  if (uniqueFiles.length) {
    throw new Error('There are duplicate templates: ' + _.join(uniqueFiles));
  }
}

function server(callback) {

  const app = express();

  // Register the static path here, to avoid getting them logged
  app.use(express.static(path.join(__dirname, 'public')));
  setupLogger(app);

  // All dirs containing templates
  const partialsDirs = [
    'views/partials',
    'views/templates'
  ];

  checkForDuplicates(partialsDirs); // TODO: Why do we need this??

  // Handlebars setup
  const hbs = exphbs.create({
    helpers: requireLocal('services/helpers'),
    partialsDir: partialsDirs
  });

  global.HBS = hbs;

  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');

  if (process.env.NODE_ENVIRONMENT === 'prod' && !config.jwt_secret) {
    throw new Error('No secret specified, please set one via jwt_secret');
  }

  if (process.env.NODE_ENVIRONMENT === 'prod' && process.env.SHOW_ERROR !== 'true') {
    app.enable('view cache');
  }

  app.use(session({
    secret: config.jwt_secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
  }));

  app.use(passport.initialize()); // Initialize password
  app.use(passport.session()); // Restore authentication state, if any
  app.use(bodyparser.urlencoded({extended: true}));
  app.use(bodyparser.json());
  app.use(cookieParser);
  app.use(connectFlash);
  app.use(requireLocal('services/i18n').init); //Set language header correctly including fallback option.
  app.use(sessionHandler);

  // Maintenance Mode
  if (process.env.FRONTEND_MAINTENANCE) {
    app.use((req, res) => {
      res.render('dynamic/register/maintenance', {
        layout: 'funnel',
        language: req.language
      });
    });
  }

  // Routers
  app.use('/', requireLocal('routes/main'));
  app.use('/', requireLocal('routes/dynamic'));
  app.use('/', requireLocal('routes/static'));
  app.use('/team', requireLocal('routes/team'));
  app.use('/post', requireLocal('routes/posting'));
  app.use('/messages', requireLocal('routes/messages'));
  app.use('/settings', requireLocal('routes/settings'));
  app.use('/admin', requireLocal('routes/admin'));

  var server = http.createServer(app);
  const io = socketio(server);
  websocket.init(io);

  // The order is important here
  // First try to handle errors
  app.use(genericErrorHandler);
  app.use(notFoundHandler);

  if (callback) {
    callback(server);
  } else {
    app.listen(3000);
  }
}

if (!IS_TEST) {
  sticky(server, {
    port: 3000
  });
}

module.exports = server;

