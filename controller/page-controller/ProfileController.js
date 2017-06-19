'use strict';

const profile = require('../../controller/page-controller/profile');

class ProfileController {

  static *showProfile(req, res) {

    let team = null;

    if (req.user.status.is.team) {
      const userEventId = req.user.me.participant.eventId;
      const userTeamId = req.user.me.participant.teamId;
      team = yield profile.getTeam(userEventId, req.user, userTeamId);
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
}

module.exports = ProfileController;