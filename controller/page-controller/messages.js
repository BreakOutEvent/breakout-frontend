'use strict';

/**
 * Controller for the Messages View.
 */

const co = require('co');

const api = require('../../services/api-proxy');
const session = require('../../controller/session');
const logger = require('../../services/logger');

let messages = {};


/**
 * Sends the occurred error back to the client, and logs it to the bunyan global logger.
 * @param res
 * @param errMsg
 * @param err
 * @returns {*}
 */
const sendErr = (res, errMsg, err) => {

  if (err) logger.error(errMsg, err);
  else logger.error(errMsg);

  res.status(500).send({ error: errMsg });
};

messages.getById = function *(req, res) {

  let threads = yield messages.getAll(req);
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
};

async function getAll(req) {
  const me = await api.getCurrentUser(req.user);
  if (me.groupMessageIds.length === 0) return [];
  return Promise.all(me.groupMessageIds.map(gMId => api.messaging.getGroupMessage(req.user, gMId)));
}

messages.getAll = getAll;

messages.searchUser = (req, res, next) => co(function*() {
  let user = yield api.user.search(req.params.string);
  res.send(user.filter(obj => obj.firstname || obj.lastname));
}).catch((ex) => {
  return sendErr(res, ex.message, ex);
});

messages.createNew = (req, res, next) => co(function *() {
  let msg = yield api.messaging.createGroupMessage(req.user, req.body);
  yield session.refreshSession(req);
  res.send(msg);
}).catch((ex) => {
  return sendErr(res, ex.message, ex);
});

messages.send = (req, res, next) => co(function *() {
  return res.send(yield api.messaging.addMessageToGroupMessage(req.user, req.params.id, req.body.text));
}).catch((ex) => {
  return sendErr(res, ex.message, ex);
});
module.exports = messages;