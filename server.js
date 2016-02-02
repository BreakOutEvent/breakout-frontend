'use strict';
var express = require('express');
var mongoose = require('./controller/mongo.js');
mongoose.con();
var exphbs = require('express-handlebars');
var path = require('path');
var passport = require('passport');
var API = require('./controller/apiProxy.js');

API.authenticate('','')
  .then(function(body) {
    console.log(body);
  })
  .catch(function(response) {
    console.log(response.statusCode)
  });

var app = express();
var hbs = exphbs.create({
  extname: '.hbs',
  helpers: {
    equals: require("handlebars-helper-equal")
  }
});

// handlebars is now default engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('express-session')({secret: 'keyboard cat', resave: false, saveUninitialized: false}));
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('cookie-parser')());
app.use(require('connect-flash')());

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Sets routes
app.use('/', require('./routes/main'));
app.use('/admin', require('./routes/admin'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

// Displays any errors
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});