'use strict';

var jwt = require('jwt-simple');
const config = {
  secret: process.env.FRONTEND_JWT_SECRET
};

Object.keys(config).forEach((k, val) => {
  if (config[k] === undefined) {
    throw new Error(`No config entry found for ${k}`);
  }
});

const admin = {};

function currTS() {
  return Math.floor(Date.now() / 1000);
}

admin.ensureAuthenticated = (req, res, next) => {
  if (!req.header('Authorization')) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }

  var payload = null;
  try {
    payload = jwt.decode(req.header('Authorization').split(' ')[1], config.secret);
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

admin.createJWT = (email) => {
  var payload = {
    sub: email,
    iat: currTS(),
    exp: currTS() + 14 * 86400
  };
  return jwt.encode(payload, config.secret);
};

module.exports = admin;
