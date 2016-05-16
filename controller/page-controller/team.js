'use strict';

const co = require('co');

const api = requireLocal('services/api-proxy');

let team = {};


team.getTeamByUrl = (teamId) => co(function*() {
  let tempTeam = yield api.team.get(teamId);
  let events = yield api.event.all();
  tempTeam.event = events.filter((event) => event.id === tempTeam.event).pop();
  return tempTeam;
}).catch((ex) => {
  throw ex;
});

module.exports = team;