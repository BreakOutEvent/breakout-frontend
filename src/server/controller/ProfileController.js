'use strict';

const logger = require('../services/logger');
const api = require('../services/api-proxy');
const session = require('./SessionController');

class ProfileController {

  static *showProfile(req, res) {

    let team = null;
    let teamInvitations = null;

    if (req.user.status.is.team) {
      const userTeamId = req.user.me.participant.teamId;
      const token = req.user;
      team = yield api.getModel(`event/${req.user.me.participant.eventId}/team`, token, userTeamId);
      teamInvitations = yield api.getModel(`team/${team.id}/invitations`, token);
    }

    res.render('dynamic/profile/profile', {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      team: team,
      teamInvitations,
      isLoggedIn: req.user,
      title: 'Profile',
      tab: req.query.tab || 'profile'
    });
  }

  static *putTeam(req, res, next) {
    let update = {
      name: req.body.teamName
    };

    if(req.body.teamDescription) update.description = req.body.teamDescription;
    if(req.body.postaddress) update.postaddress = req.body.postaddress;

    if (req.file) {
      logger.debug('Uploading updated team picture to cloudinary');
      const res = yield api.uploadFile(req.file);
      update.profilePic = {
        type: 'IMAGE',
        url: res.secure_url
      };
      logger.debug('Attaching updated team picture url to backend request');
    }

    logger.info('Trying to update a team', update);

    yield api.putModel(`event/${req.user.me.participant.eventId}/team`, req.user.me.participant.teamId, req.user, update);

    logger.info('Updated a team', update);

    yield session.refreshSession(req);
    return res.send({});
  }

  static *inviteTeamMember(req, res) {
    const email = req.body.teamMemberEmail;
    if (!email) return sendErr(res, 'Empty email!');
    const token = req.user;

    const { eventId, teamId } = req.user.me.participant;

    logger.info('Trying to invite user', email, 'to team', teamId);
    const invite = yield api.inviteUser(token, eventId, teamId, email);
    if (!invite) return sendErr(res, 'Invite creation failed!');

    logger.info('Created Invitation for user', req.body.email, 'to team', teamId);

    return res.send(invite);
  }
}

const sendErr = (res, errMsg, err) => {

  if (err) logger.error(errMsg, err);
  else logger.error(errMsg);

  res.status(500).send({ error: errMsg });
};

module.exports = ProfileController;