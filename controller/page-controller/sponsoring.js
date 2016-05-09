'use strict';

const co = require('co');

const api = requireLocal('services/api-proxy');

const sponsoring = {};

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

/**
 * Creates a sponsoring.
 * @param req
 * @param res
 * @param next
 */

sponsoring.create = (req, res, next) => co(function*(){

  let body = {};

  if(!req.body.amountPerKm) return sendErr(res, 'amountPerKm is missing');

  body.amountPerKm = req.body.amountPerKm;
  if(req.body.limit) body.limit = req.body.limit;

  const sponsoring = yield api.sponsoring.create(
    req.user,
    req.user.me.participant.eventId,
    req.user.me.participant.teamId,
    body);

  res.send(sponsoring);

}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.getByTeam = (req) => co(function*(){

  return yield api.sponsoring.getByTeam(
    req.user,
    req.user.me.participant.eventId,
    req.user.me.participant.teamId);

}).catch(ex => {
  throw ex;
});

sponsoring.getBySponsor = (req) => co(function*(){

  return yield api.sponsoring.getBySponsor(
    req.user,
    req.user.me.participant.eventId,
    req.user.me.participant.teamId);

}).catch(ex => {
  throw ex;
});



module.exports = sponsoring;