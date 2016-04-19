'use strict';
const api = require('./api-proxy');
const mongoose = require('./mongo');
const Token = mongoose.model('token', require('../schemas/token.js'));

const CACHE_TIME = 900000;

let ses = {};

ses.getUserInfo = (req) => {
  return new Promise((resolve, reject) => {
    if(!req.isAuthenticated()) reject({error: 'No user specified'});
    if(!req.user.user || req.user.user.ts < Date.now() - CACHE_TIME) {
      api.getCurrentUser(req.user)
        .then(user => {
          Token.update({_id: req.user._id}, {$set: {user: user, ts: Date.now()}}, (err) => {
            if(err) reject({error: 'Could not update user'});
            resolve(user)
          });
        })
        .catch(body => reject({error: 'Could not fetch user'}));
    } else {
      resolve(req.user.user);
    }
  });
};

ses.forceUpdate = (req) => {
  ses.getUserInfo(req);
};

module.exports = ses;