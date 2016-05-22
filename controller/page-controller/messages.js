'use strict';

/**
 * Controller for the Messages View.
 */

const co = require('co');

const api = requireLocal('services/api-proxy');

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
  req.user = {};
  req.user.me = {
    firstname: "asfd",
    lastname: "asdf",
    id: 23,
    participant: null,
    profilePic: {
      id: 10,
      type: "IMAGE",
      uploadToken: null,
      sizes: []
    },
    roles: [],
    blocked: true,
    groupMessageIds: [10]
  };

  if(req.user.me.groupMessageIds.length === 0) return [];
  return yield req.user.me.groupMessageIds.map(gMId => api.messaging.getGroupMessage(req.user, gMId));

}).catch((ex) => {
  throw ex;
});

messages.searchUser = (req, res, next) => co(function*() {
  let user = yield api.user.search(req.params.string);
  res.send(user);
}).catch((ex) => {
  return sendErr(res, ex.message, ex);
});

module.exports = messages;