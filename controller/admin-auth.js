'use strict';

/**
 * Controller for the CMS-Login.
 */

var jwt = require('jwt-simple');
var config = requireLocal('config/config.js');


Object.keys(config).forEach((k, val) => {
  if (config[k] === undefined) {
    throw new Error(`No config entry found for ${k}`);
  }
});

const admin = {};

function currTS() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Middleware to ensure the user is authenticated.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
admin.ensureAuthenticated = (req, res, next) => {
  if (!req.header('Authorization')) {
    return res.status(401)
      .send({ message: 'Please make sure your request has an Authorization header' });
  }

  var payload = null;
  try {
    payload = jwt.decode(req.header('Authorization').split(' ')[1], config.jwt_secret);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= currTS()) {
    return res.status(401).send({ message: 'Token has expired' });
  }

  req.cmsUser = payload.sub;
  next();
};

/**
 * Creates the JWT token for the given email.
 * @param email
 * @returns {String}
 */
admin.createJWT = (email) => {
  var payload = {
    sub: email,
    iat: currTS(),
    exp: currTS() + 14 * 86400
  };
  return jwt.encode(payload, config.jwt_secret);
};

module.exports = admin;
