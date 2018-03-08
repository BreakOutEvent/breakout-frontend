'use strict';

const logger = require('../services/logger');
const api = require('../services/api-proxy');
const session = require('./SessionController');

class ProfileController {

  static *showProfile(req, res) {

    let team = null;

    if (req.user.status.is.team) {
      const userTeamId = req.user.me.participant.teamId;
      const token = req.user;
      team = yield api.getModel(`event/${req.user.me.participant.eventId}/team`, token, userTeamId);
    }

    res.render('dynamic/profile/profile', {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      team: team,
      isLoggedIn: req.user,
      title: 'Profile'
    });
  }

  static *putTeam(req, res, next) {
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
  }
}

module.exports = ProfileController;