'use strict';

const passport = require('passport');

class AuthenticationController {
  static login(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('error', 'Ungültige Kombination aus Email und Passwort');
        return res.redirect('/login');
      }
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        let url = req.flash('url');
        if (Array.isArray(url)) url = url[url.length - 1];
        if (url) return res.redirect(url);
        return res.redirect('/');
      });
    })(req, res, next);
  }
}

module.exports = AuthenticationController;