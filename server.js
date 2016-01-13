'use strict';
var express = require('express');
var request = require('request');
var exphbs = require('express-handlebars');
var path = require('path');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./schemas/user');

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function (username, password, cb) {
        db.findByUsername(username, function (err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false, {message: 'User does not exist!'});
            }
            if (user.password != password) {
                return cb(null, false, {message: 'Username/password do not match'});
            }
            return cb(null, user, {message: 'Successfully logged in'});
        });
    }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    db.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    })
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