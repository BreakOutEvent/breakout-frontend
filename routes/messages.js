'use strict';

/**
 * Routes for all messages related requests
 */

const express = require('express');
const co = require('co');
const multer = require('multer');

const messages = requireLocal('controller/page-controller/messages');
const session = requireLocal('controller/session');

const upload = multer({inMemory: true});
const router = express.Router();

session.isUser = (req, res, next) => next();

router.get('/:messageId?', session.isUser, (req, res, next) => co(function*() {

  req.user.me.groupMessageIds = [10,11];

  let threads = yield messages.getAll(req);
  let activeMessage = threads[threads.length - 1];
  if (req.params.messageId) {
    activeMessage = threads.filter(m => m.id === req.params.messageId)[0];
  }

  res.render(`dynamic/message/message`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      threads: threads,
      activeMessage: activeMessage,
      title: 'Nachrichten'
    });

}).catch(next));

router.post('/search/:string', messages.searchUser);

router.post('/new', messages.createNew);

router.post('/send/:id', messages.send);


module.exports = router;
