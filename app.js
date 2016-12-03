/*
 * The application entry point
 * Here all express middleware, routers, config, logging,
 * globals and socket.io will be loaded / initialized.
 */

'use strict';

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

const mongoose = require('./controller/mongo.js');
const passport = require('./services/auth.js');
const API = require('./services/api-proxy');
const websocket = require('./services/websocket');

function setupLogger(app) {
  if (IS_TEST) return;
  app.use(morgan('combined', {stream: fs.createWriteStream(ROOT + '/logs/access.log', {flags: 'a'})}));
}

// TODO: eslint ignore unused
// next may be unused but must be here in order to be work properly!
function genericErrorHandler(err, req, res, next) {

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

function maintenanceView(req, res, next) {
  if(req.app.get('maintenance')) {
    res.render('dynamic/register/maintenance', {
      layout: 'funnel',
      language: req.language
    });
  } else {
    next();
  }
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
    helpers: require('./services/helpers'),
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
  app.use(require('./services/i18n').init); //Set language header correctly including fallback option.
  app.use(sessionHandler);
  app.use(maintenanceView);

  // Routers
  app.use('/', require('./routes/main'));
  app.use('/', require('./routes/dynamic'));
  app.use('/', require('./routes/static'));
  app.use('/team', require('./routes/team'));
  app.use('/post', require('./routes/posting'));
  app.use('/messages', require('./routes/messages'));
  app.use('/settings', require('./routes/settings'));
  app.use('/admin', require('./routes/admin'));

  // ENV specific setup
  if(process.env.FRONTEND_MAINTENANCE) app.enable('maintenance');
  else app.disable('maintenance');

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

