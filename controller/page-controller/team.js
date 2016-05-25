'use strict';

/**
 * Controller for the BreakOut-Member-Page.
 */

const co = require('co');
const _ = require('lodash');

const api = requireLocal('services/api-proxy');

let team = {};

/**
 * Sends the occurred error back to the client, and logs it to the bunyan global logger.
 * @param res
 * @param errMsg
 * @param err
 * @returns {*}
 */
const sendErr = (res, errMsg, err) => {

  if (err) logger.error(errMsg, err);
  else logger.error(errMsg);

  res.status(500).send({error: errMsg});
};

team.getTeamByUrl = (teamId, token) => co(function*() {
  let tempTeam = yield api.team.get(teamId);

  //ONLY VIEW FULLY PAID TEAMS
  if(!tempTeam.hasFullyPaid) return tempTeam;

  let events = yield api.event.all();
  tempTeam.event = events.filter((event) => event.id === tempTeam.event).pop();

  let allSponsors = yield api.sponsoring.getByTeam(tempTeam.event.id, tempTeam.id);
  allSponsors = allSponsors.filter(s => s.status === 'ACCEPTED' && !s.sponsorIsHidden);
  tempTeam.sponsors = yield allSponsors.map(sponsor => {
    if (sponsor.userId) return api.user.get(sponsor.userId);
    return sponsor.unregisteredSponsor;
  });
  
  let allChallenges = yield api.challenge.getByTeam(tempTeam.event.id, tempTeam.id);
  tempTeam.challenges = allChallenges.filter(s => s.status === 'ACCEPTED');

  let postingIds = yield api.team.getPostingIds(teamId);
  let allPostings = yield api.posting.getPostingsByIds(postingIds, token);
  tempTeam.postings = allPostings.reverse();

  let locations = yield api.location.getByTeam(teamId);

  tempTeam.max = {};
  tempTeam.max.distance = yield api.team.getDistance(teamId);
  tempTeam.max.donations = yield api.team.getDonations(teamId);
  
  tempTeam.mapData = [{
    id: teamId,
    name: tempTeam.name,
    event: tempTeam.event,
    locations: locations,
    members: []
  }];

  tempTeam.members.forEach((m,i) => {
    tempTeam.mapData[0].members[i] = {
      firstname: m.firstname
    }
  });

  return tempTeam;
}).catch((ex) => {
  throw ex;
});

team.createPost = (req, res, next) => co(function*() {

  let mediaType = req.body.mediaType === '' ? null : [req.body.mediaType];

  let post = yield api.posting.createPosting(
    req.user,
    req.body.postText,
    mediaType,
    req.body.latitude,
    req.body.longitude);

  if (req.body.mediaType !== '' && req.file) {
    yield post.media.map(m => api.uploadPicture(req.file, m));
  }

  res.sendStatus(200);

}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

team.createLike = (req, res, next) => co(function*() {
  
  yield api.posting.createLike(req.user, req.body.postingId);
  res.sendStatus(200);

}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

team.createComment = (req, res, next) => co(function*() {

  yield api.posting.createComment(req.user, req.body.id, req.body.text);
  res.sendStatus(200);

}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

team.isAuth = (req, res, next) => {
  if(req.isAuthenticated()) return res.sendStatus(200);
  return res.sendStatus(401);
};

module.exports = team;