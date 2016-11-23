'use strict';

const api = requireLocal('services/api-proxy');

let posting = {};

posting.getByHashtag = function *(req, res) {
  const postings = yield api.posting.getPostingsByHashtag(req.params.hashtag, req.user);

  let currentUser = null;

  if (req.user && req.user.me) {
    currentUser = req.user.me;
  }

  res.render('dynamic/posting/hashtag', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    postings: postings,
    user: currentUser,
    isLoggedIn: req.user,
    hashtag: req.params.hashtag,
    title: `Hashtag '${req.params.hashtag}'`
  });
};

// TODO: Check proper error handling here!
posting.getById = function *(req, res) {

  const postings = yield api.posting.getPosting(req.params.postingId, req.user);

  let currentUser = null;

  if (req.user && req.user.me) {
    currentUser = req.user.me;
  }

  res.render('dynamic/posting/posting', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    postings: [postings],
    user: currentUser,
    isLoggedIn: req.user,
    title: postings.text
  });
};

module.exports = posting;