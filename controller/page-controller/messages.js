'use strict';

/**
 * Controller for the Messages View.
 */

const co = require('co');

const api = requireLocal('services/api-proxy');
const session = requireLocal('controller/session');

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

  res.status(500).send({error: errMsg});
};

messages.getAll = (req) => co(function*() {
  if (req.user.me.groupMessageIds.length === 0) return [];
  return yield req.user.me.groupMessageIds.map(gMId => api.messaging.getGroupMessage(req.user, gMId));
}).catch((ex) => {
  throw ex;
});

messages.searchUser = (req, res, next) => co(function*() {
  let user = yield api.user.search(req.params.string);
  res.send(user.slice(0, 5).filter(obj => obj.firstname || obj.lastname));
}).catch((ex) => {
  return sendErr(res, ex.message, ex);
});

messages.createNew = (req, res, next) => co(function *() {
  res.send(yield api.messaging.createGroupMessage(req.user, req.body));
  yield session.refreshSession(req);
}).catch((ex) => {
  return sendErr(res, ex.message, ex);
});

messages.send = (req, res, next)   => co(function *() {
  return res.send(yield api.messaging.addMessageToGroupMessage(req.user, req.params.id, req.body.text));
}).catch((ex) => {
  return sendErr(res, ex.message, ex);
});
module.exports = messages;