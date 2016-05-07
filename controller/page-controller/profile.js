'use strict';

/**
 * Controller for the profile page.
 */

const co = require('co');

const session = requireLocal('controller/session');
const api = requireLocal('services/api-proxy');

let profile = {};

profile.putTeam = (req, res, next) => co(function*() {

  let update = {
    name: req.body.name,
    description: req.body.description
  };

  logger.info('Trying to update a team', update);

  const backendUser = yield api.putModel('team', req.user.me.participant.teamId, req.user, update);

  //TODO upload file properly
  if (req.file) {
    yield api.uploadPicture(req.file, backendUser.profilePic[0]);
  }

  logger.info('Updated a team', update);

  yield session.refreshSession(req);
  return res.send({});
}).catch(ex => {
  logger.error(ex);
  return res.sendStatus(500);
});

module.exports = profile;
