'use strict';

/**
 * Routes for all hashtag related requests
 */
const api = requireLocal('services/api-proxy');
const Router = require('co-router');
const router = new Router();

router.get('/hashtag/:hashtag', function *(req, res) {
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
});

// TODO: Check proper error handling here!
router.get('/:postingId', function *(req, res) {

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
});

module.exports = router;