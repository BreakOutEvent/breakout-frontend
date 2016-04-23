'use strict';

var jwt = require('jwt-simple');
const secret = process.env.FRONTEND_JWT_SECRET;

const admin = {};

function currTS () {
  return Math.floor(Date.now() / 1000);
}

admin.ensureAuthenticated = (req, res, next) => {
  if (!req.header('Authorization')) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, secret);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= currTS()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
  });
  req.cmsUser = payload.sub;
  next();
};

admin.createJWT = (email) => {
  var payload = {
    sub: email,
    iat: currTS(),
    exp: currTS() + 14 * 86400
  };
  return jwt.encode(payload, secret);
};

module.exports = admin;