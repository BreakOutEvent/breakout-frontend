'use strict';

/**
 * Routes for all hashtag related requests
 */

const express = require('express');
const co = require('co');

const posting = requireLocal('controller/page-controller/posting');
const session = requireLocal('controller/session');

const router = express.Router();

router.get('/:hashtag', (req, res, next) => co(function*() {
  const postings = yield posting.getByHashtag(req.params.hashtag, req.user);

  let currentUser = null;

  if (req.user && req.user.me) {
    currentUser = req.user.me;
  }

  res.render(`dynamic/posting/hashtag`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      postings: postings,
      user: currentUser,
      title: `Hashtag '${req.params.hashtag}'`
    });
}).catch(next));

module.exports = router;