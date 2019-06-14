'use strict';

const api = require('../services/api-proxy');

let challenge = {};

challenge.getPostingsById = function *(req, res) {
  const postings = yield api.challenge.getPostings(req.user, req.params.challengeId);

  let currentUser = null;

  if (req.user && req.user.me) {
    currentUser = req.user.me;
  }

  res.render('dynamic/posting/posting', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    postings: postings,
    user: currentUser,
    isLoggedIn: req.user
  });
};

module.exports = challenge;
