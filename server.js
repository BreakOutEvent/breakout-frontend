'use strict';
var express = require('express');
var request = require('request');
var mongoose = require('./controller/mongo.js');
var reader = require('./controller/templateReader.js');
mongoose.con();
var exphbs = require('express-handlebars');
var path = require('path');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
// var User = require('./schemas/user');
var mongoose = require('mongoose');

// models
var User = mongoose.model('User', require('./schemas/user.js'));

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
    function (username, password, cb) {
        User.findByUsername(username)
            .then(function (user) {
                user.validatePassword(password)
                    .then(function () { cb(null, user, {message: 'Successfully logged in'}) })
                    .catch(function () { cb(null, false, {message: 'The provided password is invalid'}) });
            })
            .catch(function () { cb(null, false, {message: 'User does not exist'}) })
    }
));

// create new user
// var testUser = new User();
// testUser.username = "jack";
// testUser.password = "secret";
// testUser.displayName = "Jack";
// testUser.emails = [ 'jack@example.com' ];
// testUser.save(function(err){console.log(err);});

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function (user, cb) {
    cb(null, user._id);
});

passport.deserializeUser(function (id, cb) {
    User.findById(id)
        .then(function (user) { cb(null, user) })
        .catch(function (err) { cb(err) });
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