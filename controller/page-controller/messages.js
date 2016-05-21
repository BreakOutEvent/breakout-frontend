'use strict';

/**
 * Controller for the Messages View.
 */

const co = require('co');

const api = requireLocal('services/api-proxy');

let messages = {};


messages.getAll = (req) => co(function*() {
  if(req.user.me.groupMessageIds.length === 0) return [];
  return yield req.user.me.groupMessageIds.map(gMId => api.messaging.getGroupMessage(req.user, gMId));

}).catch((ex) => {
  throw ex;
});

module.exports = messages;