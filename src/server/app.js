/*
 * The application entry point
 * Here all express middleware, routers, config, logging,
 * globals and socket.io will be loaded / initialized.
 */

'use strict';


global.IS_TEST = process.env.FRONTEND_RUN_TESTS === 'true';
global.ROOT = require('path').resolve(__dirname);

// This is a workaround, because we currently use NODE_ENVIRONMENT
// instead if NODE_ENV because legacy
// TODO: Fix this and use NODE_ENV everywhere, adapt for 'staging'

if (process.env.NODE_ENVIRONMENT === 'prod') {
  process.env.NODE_ENV = 'production';
}

if (process.env.NODE_ENVIRONMENT === 'staging') {
  process.env.NODE_ENV = 'production';
}

const compression = require('compression');
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
const contentful = require('./services/contentful');
const Raven = require('raven');

const mongoose = require('./services/mongo.js');
const passport = require('./services/auth.js');
const API = require('./services/api-proxy');
const websocket = require('./services/websocket');

Raven.config(config.sentry.serverDsn).install();

function setupLogger(app) {
  if (IS_TEST) return;

  app.use(morgan(':remote-addr :method :url :status :response-time ms - :res[content-length]', {
    stream: {
      write: function (message) {
        logger.info(message.trim('\n'));
      }
    }
  }));
}

function formatStackTrace(unformatted) {
  return unformatted
    .replace(/\n/g, '<br/>')
    .replace(/at /g, '&nbsp;&nbsp;&nbsp;&nbsp;at ');
}

// TODO: eslint ignore unused
// next may be unused but must be here in order to be work properly!
function genericErrorHandler(err, req, res, next) {

  logger.error(err);

  res.status(err.status || 500);

  const code = err.status;
  const message = 'Internal Server Error: ' + res.sentry;
  let stacktrace = undefined;

  if (config.debug && config.debug.displayStackTrace) {
    try {
      stacktrace = formatStackTrace(err.stack);
    } catch (err) {
      stacktrace = 'Error formatting stacktrace';
    }
  }

  res.render('layouts/error', {
    code,
    message,
    stacktrace
  });
}

function notFoundHandler(req, res) {
  res.status(404);
  res.render('layouts/error', {
    code: 404,
    message: req.url + ' could not be found on this server'
  });
}

function sessionHandler(req, res, next) {
  co(function* () {
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

function maintenanceView(req, res, next) {
  if (req.app.get('maintenance')) {
    res.render('dynamic/register/maintenance', {
      layout: 'funnel',
      language: req.language
    });
  } else {
    next();
  }
}

function emergencyView(req, res, next) {
  if (req.app.get('emergency')) {

    contentful.getFieldsForContentType('notfallSeite', req.contentfulLocale).then(function (data) {
      let options = {
        titel: data[0].titlel,
        description: data[0].beschreibung,
        layout: 'funnel'
      };

      res.render('dynamic/register/emergency', options);
    });

  } else {
    next();
  }
}


function contentfulLocale(req, res, next) {
  var preferredLanguage = req.acceptsLanguages()[0];


  if (preferredLanguage.substring(0, 2) === 'de') {
    preferredLanguage = 'de';
  } else {
    preferredLanguage = 'en-US';
  }

  req.contentfulLocale = preferredLanguage;
  logger.debug(`Using contentfulLocale ${preferredLanguage} from acceptsLanguage ${req.acceptsLanguage()[0]}`);

  next();
}

function contentfulRawHtml(req, res, next) {
  contentful.getFieldsForContentType('rawHtml')
    .then(pages => {
      const matchedPages = pages.filter(page => page.url === req.url);
      if (matchedPages.length > 0) {
        res.status(200);
        res.send(matchedPages[0].content);
      } else if (next) {
        next();
      }
    })
    .catch(err => {
      if (next) next(err);
    });
}

function server(callback) {

  const app = express();

  app.use(compression());
  // Register the static path here, to avoid getting them logged
  app.use(express.static(path.join(__dirname, '../../dist')));
  setupLogger(app);

  // All dirs containing templates
  const partialsDirs = [
    path.join(__dirname, 'views/partials'),
    path.join(__dirname, 'views/templates')
  ];

  app.set('views', path.join(__dirname, '/views'));

  const hbs = exphbs({
    layoutsDir: path.join(__dirname + '/views/layouts'),
    partialsDir: partialsDirs,
    helpers: require('./services/helpers')
  });

  global.HBS = hbs;

  app.engine('handlebars', hbs);
  app.set('view engine', 'handlebars');

  if (process.env.NODE_ENVIRONMENT === 'prod' && !config.jwt_secret) {
    throw new Error('No secret specified, please set one via jwt_secret');
  }

  if (process.env.NODE_ENVIRONMENT === 'prod' && process.env.SHOW_ERROR !== 'true') {
    // TODO: enable in production
    // app.enable('view cache');
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
  app.use(require('./services/i18n').init); //Set language header correctly including fallback option.
  app.use(sessionHandler);
  app.use(maintenanceView);
  app.use(emergencyView);

  app.use(contentfulLocale);

  // Routers
  app.use('/', require('./routes/dynamic'));
  app.use('/', require('./routes/static'));
  app.use('/team', require('./routes/team'));
  app.use('/post', require('./routes/posting'));
  app.use('/messages', require('./routes/messages'));
  app.use('/settings', require('./routes/settings'));
  app.use('/admin', require('./routes/admin'));
  app.use('/challenge', require('./routes/challenge'));

  // ENV specific setup
  if (process.env.FRONTEND_MAINTENANCE) app.enable('maintenance');
  else app.disable('maintenance');

  if (process.env.FRONTEND_EMERGENCY) app.enable('emergency');
  else app.disable('emergency');

  var server = http.createServer(app);
  const io = socketio(server);
  websocket.init(io);

  app.use(contentfulRawHtml);
  // The order is important here
  // First try to handle errors
  app.use(Raven.errorHandler());
  app.use(genericErrorHandler);
  app.use(notFoundHandler);

  if (callback) {
    callback(server);
  } else {
    app.listen(3000);
  }
}

if (config.cluster) {
  sticky(server, {port: 3000});
} else {
  server();
}

module.exports = server;
