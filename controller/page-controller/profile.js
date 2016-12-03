'use strict';

/**
 * Controller for the profile page.
 */

const co = require('co');
const logger = require('../services/logger');

const session = requireLocal('controller/session');
const api = requireLocal('services/api-proxy');

let profile = {};

profile.putTeam = (req, res, next) => co(function*() {

  let update = {
    name: req.body.teamName
  };
  
  if(req.body.teamDescription) update.description = req.body.teamDescription;
  
  logger.info('Trying to update a team', update);

  const backendUser = yield api.putModel(`event/${req.user.me.participant.eventId}/team`, req.user.me.participant.teamId, req.user, update);

  if (req.file) {
    yield api.uploadPicture(req.file, backendUser.profilePic);
  }

  logger.info('Updated a team', update);

  yield session.refreshSession(req);
  return res.send({});
}).catch(ex => {
  logger.error(ex);
  return res.sendStatus(500);
});

profile.getTeam = (req) => co(function*() {
  return yield api.getModel(`event/${req.user.me.participant.eventId}/team`, req.user, req.user.me.participant.teamId);
}).catch(ex => {
  logger.error(ex);
  return null;
});

module.exports = profile;
