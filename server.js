'use strict';
var express = require('express');
var request = require('request');
var mongoose = require('./controller/mongo.js');
var reader = require('./controller/templateReader.js');
mongoose.con();
var exphbs = require('express-handlebars');
var path = require('path');

var app = express();
var hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        equals: require("handlebars-helper-equal")
    }
});

//hbs.registerHelper("equal", );

// handlebars is now default engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

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