'use strict';

/**
 * Controller for the BreakOut-Member-Page.
 */

const co = require('co');
const _ = require('lodash');
const fs = require('fs');
const logger = require('../../services/logger');
const Promise = require('bluebird');
const request = require('request');
const config = require('../../config/config');

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

  res.status(500).send({error: errMsg});
};

function shouldSponsoringBeDisplayed(sponsoring) {
  return (sponsoring.status === 'ACCEPTED' || sponsoring.status === 'PAYED') && !sponsoring.sponsor.sponsorIsHidden;
}

function shouldChallengeBeDisplayed(challenge) {
  return challenge.status === 'ACCEPTED' || challenge.status === 'WITH_PROOF' || challenge.status === 'PROOF_ACCEPTED';
}

function transformEventAddYear(e) {
  e.year = new Date(e.date * 1000).getFullYear();
  return e;
}

async function fetchProfileData(teamId, token) {
  let responses = await Promise.all([
    api.team.get(teamId),
    api.event.all(),
    api.challenge.getOverviewForTeamProfile(teamId),
    api.sponsoring.getOverviewForTeamProfile(teamId),
    api.team.getPostings(token, teamId, 0),
    api.team.getLocations(teamId)
  ]);

  let tempTeam = responses[0];
  let events = responses[1];
  let allChallenges = responses[2];
  let allSponsors = responses[3];
  let postings = responses[4];
  let locations = responses[5];

  tempTeam.postings = postings;

  tempTeam.event = events
    .filter((event) => event.id === tempTeam.event)
    .map(transformEventAddYear).pop();

  tempTeam.max = {};
  tempTeam.max.distance = 0;
  tempTeam.max.donations = 0;

  //ONLY VIEW FULLY PAID TEAMS
  if (!tempTeam.hasFullyPaid) return tempTeam;

  tempTeam.sponsors = allSponsors
    .filter(shouldSponsoringBeDisplayed)
    .map(sponsoring => sponsoring.sponsor);

  tempTeam.challenges = allChallenges.filter(shouldChallengeBeDisplayed);
  tempTeam.openChallenges = allChallenges.filter(s => s.status === 'ACCEPTED');

  const distances = await Promise.all([
    api.team.getDistance(teamId),
    api.team.getDonations(teamId)
  ]);

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
}

async function fetchTeamOverview(activeEvents, sort) {

  let eventsInfo = await api.event.allActiveInfo(activeEvents);

  let allTeamsEvents = await Promise.all(eventsInfo.events.map((e) => api.team.getAllByEvent(e.id)));
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
}

team.createPost = (req, res, next) => co(function*() {

  let mediaType = req.body.mediaType === '' ? null : [req.body.mediaType];

  let post = yield api.posting.createPosting(
    req.user,
    req.body.postText,
    mediaType,
    req.body.latitude,
    req.body.longitude);

  try {
    if (req.body.challenge) {
      logger.info('Trying to add proof to challenge');
      yield api.challenge.proof(req.user, req.body.challenge, post.id);
    }
  } catch (err) {
    logger.error('Failed to add challenge to posting' + err);
  }

  if (req.body.mediaType !== '' && req.file) {
    try {
      yield post.media.map(m => uploadPicture(req.file, m));
    } catch (err) {
      logger.error('error uploading file : ' + err);
    }
  }

  res.sendStatus(200);

}).catch((ex) => {
  logger.error('Error uploading file: ' + ex);
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

function uploadPicture(file, mediaObj) {
  logger.info('Trying to upload file with id', mediaObj.id);
  return new Promise(function (resolve, reject) {
    request.post({
      url: `${config.media_url}`,
      headers: {'X-UPLOAD-TOKEN': mediaObj.uploadToken},
      formData: {
        id: mediaObj.id,
        file: {
          value: file.buffer,
          options: {
            filename: file.originalname,
            encoding: file.encoding,
            'Content-Type': file.mimetype,
            knownLength: file.size
          }
        }
      }
    }, function (err, httpRes, body) {
      if (err) reject(err);
      else resolve(body);
    });
  });
}

// Use this Object.assign syntax until no
// more functions are exported via team.funcName
module.exports = Object.assign({}, team, {
  fetchProfileData,
  getAll: fetchTeamOverview
});