'use strict';

/**
 * Controller for the BreakOut-Member-Page.
 */

const co = require('co');
const _ = require('lodash');
const fs = require('fs');
const logger = require('../../services/logger');

const api = require('../../services/api-proxy');

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

  res.status(500).send({ error: errMsg });
};

team.getTeamByUrl = (teamId, token) => co(function*() {
  let tempTeam = yield api.team.get(teamId);


  let events = yield api.event.all();
  tempTeam.event = events.filter((event) => event.id === tempTeam.event).map(e => {
    e.year = new Date(e.date * 1000).getFullYear();
    return e;
  }).pop();

  tempTeam.max = {};
  tempTeam.max.distance = 0;
  tempTeam.max.donations = 0;

  //ONLY VIEW FULLY PAID TEAMS
  if (!tempTeam.hasFullyPaid) return tempTeam;

  let allSponsors = yield api.sponsoring.getByTeam(tempTeam.event.id, tempTeam.id);
  allSponsors = allSponsors.filter(s => (s.status === 'ACCEPTED' || s.status === 'PAYED') && !s.sponsorIsHidden);
  tempTeam.sponsors = yield allSponsors.map(sponsor => {
    if (sponsor.userId) return api.user.get(sponsor.userId);
    return sponsor.unregisteredSponsor;
  });

  let allChallenges = yield api.challenge.getByTeam(tempTeam.event.id, tempTeam.id);
  tempTeam.challenges = allChallenges.filter(s => s.status === 'ACCEPTED' || s.status === 'WITH_PROOF' || s.status === 'PROOF_ACCEPTED');
  tempTeam.openChallenges = allChallenges.filter(s => s.status === 'ACCEPTED');

  tempTeam.postings = yield api.team.getPostings(token, teamId, 0)
;
  let locations = _.map(
    _.sortBy(
      _.filter(tempTeam.postings, p => p.postingLocation && p.postingLocation.duringEvent),
      p => p.date),
    p => _.pick(p.postingLocation, ['latitude', 'longitude'])
  );

  const distances = yield [
    api.team.getDistance(teamId),
    api.team.getDonations(teamId)
  ];

  tempTeam.max.distance = distances[0].distance.toFixed(0);
  tempTeam.max.donations = distances[1].fullSum.toFixed(2);

  tempTeam.mapData = [{
    id: teamId,
    name: tempTeam.name,
    event: tempTeam.event,
    locations: locations,
    members: []
  }];

  tempTeam.members.forEach((m, i) => {
    tempTeam.mapData[0].members[i] = {
      firstname: m.firstname
    };
  });

  return tempTeam;
}).catch((ex) => {
  throw ex;
});

team.getAll = (activeEvents, sort) => co(function*() {

  let eventsInfo = yield api.event.allActiveInfo(activeEvents);

  let allTeamsEvents = yield eventsInfo.events.map((e) => api.team.getAllByEvent(e.id));
  let allTeamsWithEvent = allTeamsEvents.map(events => {
    return events.map(team => {
      team.event = eventsInfo.events.filter(e => e.id === team.event).pop();
      return team;
    });
  });

  let allTeams = _.flatten(allTeamsWithEvent);
  allTeams = allTeams.filter(t => {
    let showTeam = t.event.date * 1000 > new Date().getTime() || t.hasFullyPaid;
    return showTeam && t.id !== 1;
  });

  if (sort) {
    allTeams = _.sortBy(allTeams, t => t[sort]);
  } else {
    allTeams = _.shuffle(allTeams);
  }

  return {
    allTeams: allTeams,
    eventsInfo: eventsInfo
  };
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

  if (req.body.challenge) {
    yield api.challenge.proof(req.user, req.body.challenge, post.id);
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

team.getLikes = (req, res, next) => co(function*() {

  let likes = yield api.posting.getLikesForPosting(req.params.postingId);

  res.send(likes);

}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

team.createComment = (req, res, next) => co(function*() {
  if (req.body.text && req.body.text !== '') {
    yield api.posting.createComment(req.user, req.body.id, req.body.text);
    return res.sendStatus(200);
  }
  return res.sendStatus(500);

}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

team.deletePosting = (req, res, next) => co(function*() {
  if (req.params.postingId && req.params.postingId !== '') {
    yield api.admin.deletePosting(req.user, req.params.postingId);
    return res.sendStatus(200);
  }
  return res.sendStatus(500);

}).catch((ex) => {
  throw ex;
});

team.deleteMedia = (req, res, next) => co(function*() {
  if (req.params.mediaId && req.params.mediaId !== '') {
    yield api.admin.deleteMedia(req.user, req.params.mediaId);
    return res.sendStatus(200);
  }
  return res.sendStatus(500);

}).catch((ex) => {
  throw ex;
});

team.deleteComment = function *(req, res) {
  if (req.params.commentId && req.params.commentId !== '') {
    const postingId = req.body.posting;
    yield api.admin.deleteComment(req.user, req.params.commentId, postingId);
    return res.sendStatus(200);
  }
  return res.sendStatus(500);

};

team.isAuth = (req, res) => {
  if (req.isAuthenticated()) return res.sendStatus(200);
  return res.sendStatus(401);
};

module.exports = team;
