'use strict';

const profile = require('./profile');

class ProfileController {

  static *showProfile(req, res) {

    let team = null;

    if (req.user.status.is.team) {
      team = yield profile.getTeam(req);
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