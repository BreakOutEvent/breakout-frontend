'use strict';

const passport = require('passport');

class AuthenticationController {
  static login(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.sendStatus(401).send({
          message: 'Bad credentials'
        });
      }
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.sendStatus(200);
      });
    })(req, res, next);
  }
}

module.exports = AuthenticationController;