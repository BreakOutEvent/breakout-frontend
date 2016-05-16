'use strict';

const co = require('co');
const _ = require('lodash');

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
  if(Number(req.body.amountPerKm_range) !== Number(req.body.amountPerKm_text)) {
    return sendErr(res, 'amountPerKm is malformed');
  }

  try {
    let obj = JSON.parse(req.body.team);
    body.team = obj.team;
    body.event = obj.event;
  } catch(ex) {
    return sendErr(res, ex.message, ex);
  }

  body.amountPerKm = req.body.amountPerKm_range;
  if(req.body.limit) body.limit = req.body.limit;
  //TODO add proper limit (BACKEND HACK)
  else body.limit = 1000000000;

  //OFFLINE PART
  if(req.body.street) {
    body.unregisteredSponsor = {};
    body.unregisteredSponsor.address = {
      street: req.body.street,
      housenumber: req.body.housenumber,
      zipcode: req.body.zipcode,
      city: req.body.city,
      country: req.body.country
    };
    body.unregisteredSponsor.firstname = req.body.firstname;
    body.unregisteredSponsor.lastname = req.body.lastname;
    body.unregisteredSponsor.company = req.body.company;
    body.unregisteredSponsor.gender = req.body.gender;

    if(!req.body.url) body.unregisteredSponsor.url = "";
    else body.unregisteredSponsor.url = req.body.url;
  }

  console.log(body);

  const sponsoring = yield api.sponsoring.create(req.user, body.event, body.team, body);

  res.send(sponsoring);

}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.getAllTeams = (req) => co(function*() {
  const events = yield api.getModel('event', req.user);

  let teamsByEvent = yield events.map((e) => api.getModel(`event/${e.id}/team`, req.user));
  return _.flatten(teamsByEvent);
}).catch(ex => {
  throw ex;
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
    req.user.me.id);

}).catch(ex => {
  throw ex;
});

sponsoring.accept = (req, res, next) => co(function*(){

  yield api.sponsoring.accept(req.user, req.body.eventId, req.body.teamId, req.body.sponsoringId);

  return res.sendStatus(200);
}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.reject = (req, res, next) => co(function*(){

  yield api.sponsoring.reject(req.user, req.body.eventId, req.body.teamId, req.body.sponsoringId);

  return res.sendStatus(200);
}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.delete = (req, res, next) => co(function*(){

  //TODO wait for backend and implement

  return res.sendStatus(200);

}).catch(ex => {
  sendErr(res, ex.message, ex);
});



module.exports = sponsoring;