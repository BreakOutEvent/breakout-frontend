'use strict';

const team = require('../../controller/page-controller/team');
const _ = require('lodash');

class TeamController {

  static *showTeamOverview(req, res) {
    const allTeams = yield team.getAll();
    const searchData = allTeams.map(t => {
      let members = t.members.map(m => {
        return {
          firstname: m.firstname,
          lastname: m.lastname
        };
      });
      return {
        name: t.name,
        id: t.id,
        members: members
      };
    });

    res.render('dynamic/team/team-overview', {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      teams: allTeams,
      searchData: searchData,
      isLoggedIn: req.user,
      title: 'Team Übersicht'
    });
  }

  static *showTeamById(req, res) {

    let teamId = parseInt(req.params.teamId);

    // TODO: Remove this dirty hack!
    if (teamId === 103) {
      res.status(404);
      return res.render('error', {
        code: 404,
        message: `Team ${req.params.teamId} could not be found on this server`
      });
    }

    const currTeam = yield team.getTeamByUrl(req.params.teamId, req.user);

    if (!currTeam.hasFullyPaid) {
      res.status(404);
      return res.render('error', {
        code: 404,
        message: `Team ${req.params.teamId} could not be found on this server`
      });
    }

    let currentUser = null;
    let isUserOfTeam = false;
    let isUserAdmin = false;

    if (req.user && req.user.me) {
      currentUser = req.user.me;
      isUserOfTeam = _.findIndex(currTeam.members, m => m.id == currentUser.id) > -1;
      isUserAdmin = _.findIndex(req.user.me.roles, r => r === 'ADMIN') > -1;
    }

    res.render('dynamic/team/team-detail', {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      team: currTeam,
      user: currentUser,
      isUserOfTeam: isUserOfTeam,
      isUserAdmin: isUserAdmin,
      isLoggedIn: req.user,
      title: currTeam.name
    });
  }
}

module.exports = TeamController;