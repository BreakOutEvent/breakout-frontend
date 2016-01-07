'use strict';
var express = require('express');
var request = require('request');
var exphbs  = require('express-handlebars');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// handlebars is now default engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Sets routes
app.use('/', require('./routes/main'));
app.use('/admin', require('./routes/admin'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

// Displays any errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});