'use strict';

/**
 * Controller for the BreakOut-Member-Page.
 */

const co = require('co');
const _ = require('lodash');

const api = requireLocal('services/api-proxy');

let team = {};


team.getTeamByUrl = (teamId) => co(function*() {
  let tempTeam = yield api.team.get(teamId);


  let events = yield api.event.all();
  tempTeam.event = events.filter((event) => event.id === tempTeam.event).pop();


  let allSponsors = yield api.sponsoring.getByTeam(tempTeam.event.id, tempTeam.id);
  allSponsors = allSponsors.filter(s => s.status === 'ACCEPTED' && !s.sponsorIsHidden);
  tempTeam.sponsors = yield allSponsors.map(sponsor => api.user.get(sponsor.sponsorId));


  let allChallenges = yield api.challenge.getByTeam(tempTeam.event.id, tempTeam.id);
  tempTeam.challenges = allChallenges.filter(s => s.status === 'ACCEPTED');

  let postingIds = yield api.team.getPostingIds(teamId);
  let allPostings = yield api.posting.getPostingsByIds(postingIds);
  tempTeam.postings = allPostings.reverse();

  return tempTeam;
}).catch((ex) => {
  throw ex;
});

module.exports = team;