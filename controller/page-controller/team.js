'use strict';

/**
 * Controller for the BreakOut-Member-Page.
 */

const co = require('co');

const api = requireLocal('services/api-proxy');

let team = {};


team.getTeamByUrl = (teamId) => co(function*() {
  let tempTeam = yield api.team.get(teamId);
  let events = yield api.event.all();
  tempTeam.event = events.filter((event) => event.id === tempTeam.event).pop();
  //tempTeam.sponsors = yield api.sponsoring.getByTeam(tempTeam.event.id, tempTeam.id);
  return tempTeam;
}).catch((ex) => {
  throw ex;
});

module.exports = team;