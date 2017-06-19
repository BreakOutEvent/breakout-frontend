'use strict';

const logger = require('../../services/logger');
const session = require('../../controller/session');
const api = require('../../services/api-proxy');

function *updateTeam(req, res) {

  let update = {
    name: req.body.teamName
  };

  if (req.body.teamDescription) update.description = req.body.teamDescription;

  logger.info('Trying to update a team', update);

  const backendUser = yield api.putModel(`event/${req.user.me.participant.eventId}/team`, req.user.me.participant.teamId, req.user, update);

  if (req.file) {
    yield api.uploadPicture(req.file, backendUser.profilePic);
  }

  logger.info('Updated a team', update);

  yield session.refreshSession(req);
  return res.send({});
}

// TODO: Belongs in api wrapper or isn't really needed at all
function getTeam(eventId, tokens, teamId) {
  return api.getModel(`event/${eventId}/team`, tokens, teamId);
}

module.exports = {
  getTeam,
  putTeam: updateTeam
};
