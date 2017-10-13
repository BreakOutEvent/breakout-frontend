'use strict';

const api = require('../../services/api-proxy');
const session = require('../../controller/session');
const logger = require('../../services/logger');


function *getById(req, res) {

  let threads = yield getAll(req);
  let activeMessage = threads[threads.length - 1];
  if (req.params.messageId) {
    activeMessage = threads.filter(m => m.id == req.params.messageId)[0];
    if (!activeMessage) {
      return res.redirect('/messages/');
    }
  }

  res.render('dynamic/message/message', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    threads: threads,
    userId: req.user.me.id,
    activeMessage: activeMessage,
    isLoggedIn: req.user,
    title: 'Nachrichten'
  });
}

async function getAll(req) {
  const me = await api.getCurrentUser(req.user);
  if (me.groupMessageIds.length === 0) return [];
  return Promise.all(me.groupMessageIds.map(gMId => api.messaging.getGroupMessage(req.user, gMId)));
}

function *searchUser(req, res) {
  let user = yield api.user.search(req.params.string);
  res.send(user.filter(obj => obj.firstname || obj.lastname));
}

function *createNew(req, res) {
  const msg = yield api.messaging.createGroupMessage(req.user, req.body);
  yield session.refreshSession(req);
  res.send(msg);
}

function *send(req, res) {
  const response = yield api.messaging.addMessageToGroupMessage(
    req.user,
    req.params.id,
    req.body.text);

  return res.send(response);
}

module.exports = {
  send,
  createNew,
  searchUser,
  getAll,
  getById
};