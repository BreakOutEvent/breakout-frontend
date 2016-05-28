'use strict';

/**
 * Controller for the BreakOut-Postings.
 */

const co = require('co');
const _ = require('lodash');
const fs = require('fs');

const api = requireLocal('services/api-proxy');

let posting = {};

posting.getByHashtag = (hashtag, token) => co(function*() {
  return yield api.posting.getPostingsByHashtag(hashtag, token);
}).catch((ex) => {
  throw  ex;
});

module.exports = posting;