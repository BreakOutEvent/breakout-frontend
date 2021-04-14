'use strict';

const _ = require('lodash');
const co = require('co');
const logger = require('../services/logger');
const Promise = require('bluebird');
const request = require('request');
const config = require('../config/config');
const api = require('../services/api-proxy');

function shouldSponsoringBeDisplayed(sponsoring) {
  return (sponsoring.status === 'ACCEPTED' || sponsoring.status === 'PAYED') && !sponsoring.sponsor.sponsorIsHidden;
}

function shouldChallengeBeDisplayed(challenge) {
  return challenge.status === 'PROPOSED' || challenge.status === 'WITH_PROOF';
}

function canChallengeBeFullfilled(challenge) {
  if (challenge.maximumCount && challenge.fulfilledCount >= challenge.maximumCount)
    return false;
  return challenge.status === 'PROPOSED' || challenge.status === 'WITH_PROOF';
}

function transformEventAddYear(e) {
  e.year = new Date(e.date * 1000).getFullYear();
  return e;
}

class TeamController {

  static* showTeamOverview(req, res) {
    const teamInfo = yield TeamController.getAll(req.session.activeEvents);
    const searchData = teamInfo.allTeams.map(t => {
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
      teams: teamInfo.allTeams,
      eventsInfo: teamInfo.eventsInfo,
      searchData: searchData,
      isLoggedIn: req.user,
      title: 'Teams'
    });
  }

  static* deletePosting(req, res, next) {
    if (req.params.postingId && req.params.postingId !== '') {
      yield api.admin.deletePosting(req.user, req.params.postingId);
      return res.sendStatus(200);
    }
    return res.sendStatus(500);
  }

  static* deleteOwnPosting(req, res, next) {
    if (req.params.postingId && req.params.postingId !== '') {
      const posting = yield api.posting.getPosting(req.params.postingId);
      logger.info('Trying to delete posting from user ', posting.user.id);
      logger.info('Trying to delete posting by user ', req.user.me.id);
      if (posting.user.id === req.user.me.id) {
        yield api.admin.deletePosting(req.user, req.params.postingId);
        return res.sendStatus(200);
      }
    }
    return res.sendStatus(500);
  }

  static* createComment(req, res, next) {
    if (req.body.text && req.body.text !== '') {
      yield api.posting.createComment(req.user, req.body.id, req.body.text);
      return res.sendStatus(200);
    }
    return res.sendStatus(500);
  }

  static* createPost(req, res, next) {

    let mediaType = null;
    let url = null;

    if (req.body.mediaType !== '' && req.file) {
      mediaType = req.body.mediaType;
      let resp = yield api.uploadFile(req.file, mediaType);
      url = resp.secure_url;
    }

    let post = yield api.posting.createPosting(
      req.user,
      req.body.postText,
      url,
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

    res.sendStatus(200);
  }

  static* createLike(req, res, next) {
    yield api.posting.createLike(req.user, req.body.postingId);
    res.sendStatus(200);

  }

  static* deleteLike(req, res, next) {
    yield api.posting.deleteLike(req.user, req.body.postingId);
    res.sendStatus(200);
  }

  static* getLikes(req, res, next) {
    let likes = yield api.posting.getLikesForPosting(req.params.postingId);
    res.send(likes);
  }

  static* deleteMedia(req, res, next) {
    if (req.params.mediaId && req.params.mediaId !== '') {
      yield api.admin.deleteMedia(req.user, req.params.mediaId);
      return res.sendStatus(200);
    }
    return res.sendStatus(500);
  }

  static* deleteComment(req, res) {
    if (req.params.commentId && req.params.commentId !== '') {
      const postingId = req.body.posting;
      yield api.admin.deleteComment(req.user, req.params.commentId, postingId);
      return res.sendStatus(200);
    }
    return res.sendStatus(500);
  }

  static isAuth(req, res) {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    } else {
      return res.sendStatus(200);
    }
  }

  static* showTeamById(req, res) {

    let teamId = parseInt(req.params.teamId);

    // TODO: Remove this dirty hack!
    if (teamId === 103) {
      res.status(404);
      return res.render('error', {
        code: 404,
        message: `Team ${req.params.teamId} could not be found on this server`
      });
    }

    const currTeam = yield TeamController.getTeamByUrl(req.params.teamId, req.user);

    currTeam.challenges = (typeof currTeam.challenges === 'undefined') ? [] : currTeam.challenges;
    currTeam.sponsors = (typeof currTeam.sponsors === 'undefined') ? [] : currTeam.sponsors;

    currTeam.challenges = currTeam.challenges.map((challenge) => {
      if (challenge.unregisteredSponsor && challenge.unregisteredSponsor.url.trim() === '') {
        challenge.unregisteredSponsor.url = undefined;
      }
      return challenge;
    });

    currTeam.sponsors = currTeam.sponsors.map((sponsor) => {
      if (!sponsor.url || sponsor.url.trim() === '') {
        sponsor.url = undefined;
      }
      if (!sponsor.company || sponsor.company.trim() === '') {
        sponsor.company = undefined;
      }
      return sponsor;
    });

    let currentUser = null;
    let teamFee = null;
    let isUserOfTeam = false;
    let isUserAdmin = false;

    if (req.user && req.user.me) {
      currentUser = req.user.me;
      isUserOfTeam = _.findIndex(currTeam.members, m => m.id === currentUser.id) > -1;
      isUserAdmin = _.findIndex(req.user.me.roles, r => r === 'EVENT_MANAGER') > -1;
    }

    if (isUserOfTeam && !currTeam.hasFullyPaid) {
      teamFee = yield api.team.getFee(teamId, req.user);
    }

    currTeam.mapData = currTeam.mapData || [];
    res.render('dynamic/team/team-detail', {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      team: currTeam,
      user: currentUser,
      isUserOfTeam: isUserOfTeam,
      isUserAdmin: isUserAdmin,
      isLoggedIn: req.user,
      teamFee: teamFee,
      title: currTeam.name
    });
  }
}

TeamController.getTeamByUrl = (teamId, token) => co(function* () {

  let responses = yield Promise.all([
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

  tempTeam.postings = postings.map(p => {
    p.teamId = tempTeam.id;
    p.teamName = tempTeam.name;
    return p;
  });

  tempTeam.event = events
    .filter((event) => event.id === tempTeam.event)
    .map(transformEventAddYear).pop();

  tempTeam.max = {};
  tempTeam.max.distance = 0;
  tempTeam.max.donations = 0;

  //ONLY VIEW FULLY PAID TEAMS
  // if (!tempTeam.hasFullyPaid) return tempTeam;

  tempTeam.sponsors = allSponsors
    .filter(shouldSponsoringBeDisplayed)
    .map(sponsoring => sponsoring.sponsor);

  tempTeam.challenges = allChallenges.filter(shouldChallengeBeDisplayed);
  tempTeam.openChallenges = allChallenges.filter(canChallengeBeFullfilled);

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

TeamController.getAll = (activeEvents, sort) => co(function* () {

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

module.exports = TeamController;
