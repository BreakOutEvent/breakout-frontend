const api = requireLocal('controller/api-proxy');
const co = require('co');
const registration = requireLocal('controller/page-controller/registration');

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

  yield registration.refreshSession(req);
  return res.send({});
}).catch(ex => {
  logger.error(ex);
  return res.sendStatus(500);
});


module.exports = profile;