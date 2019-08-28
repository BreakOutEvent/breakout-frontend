'use strict';

/**
 * Backend-API service.
 * @type {*|co}
 */

const co = require('co');
const request = require('request');
const axios = require('axios');
const crequest = require('co-request');
const config = require('../config/config.js');
const url = `${config.api.protocol}://${config.api.url}`;
const logger = require('../services/logger');
const _ = require('lodash');
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

var API = {};

API.getTeamOverview = (accessToken) => {
  return axios.get(`${url}/teamoverview/`, {
    headers: { 'Authorization': `Bearer ${accessToken}`}
  });
};

API.getAllChallenges = (accessToken) => {
  return axios.get(`${url}/admin/allchallenges/`, {
    headers: { 'Authorization': `Bearer ${accessToken}`}
  });
};

API.getCallsForTeam = (accessToken, teamId) => {
  return axios.get(`${url}/teamoverview/${teamId}/calls/`, {
    headers: { 'Authorization': `Bearer ${accessToken}`}
  });
};

API.authenticate = (username, password) => {
  logger.info('Trying to login user', username);
  return new Promise((resolve, reject) => {
    request
      .post({
        url: `${url}/oauth/token`,
        qs: {
          grant_type: 'password',
          scope: 'read write'
        },
        auth: {
          user: config.api.client_id,
          pass: config.api.client_secret
        },
        form: { username: username, password: password }
      }, handleResponse(resolve, reject, 'Authenticated user ' + username));
  });
};

API.refresh = (user) => co(function*() {
  logger.info('Trying to refresh token for user', user.email);
  const req = yield crequest
    .post({
      url: `${url}/oauth/token`,
      qs: {
        client_id: config.api.client_id,
        client_secret: config.api.client_secret,
        grant_type: 'refresh_token',
        refresh_token: user.refresh_token
      },
      auth: {
        user: config.api.client_id,
        pass: config.api.client_secret
      }
    });

  if (req.statusCode in [200, 201]) {
    logger.info('Refreshed token for user ' + user.email);
  }

  return JSON.parse(req.body);
}).catch(ex => {
  throw ex;
});

API.getCurrentUserco = user => co(function*() {
  logger.info('Trying to get currently logged in user', user.email);
  const req = yield crequest
    .get({
      url: `${url}/me/`,
      auth: { bearer: user.access_token }
    });

  if (req.statusCode in [200, 201]) {
    logger.info('Got information about currently logged in user', user.email);
  }

  return JSON.parse(req.body);
}).catch(ex => {
  throw ex;
});

API.getCurrentUser = token => {
  logger.info('Trying to get currently logged in user');
  return new Promise((resolve, reject) =>
    request
      .get({
        url: `${url}/me/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Got information about currently logged in user'))
  );
};

API.getModel = (modelName, token, id) => {
  logger.info('Trying to get', modelName, 'with id', (id || 'noID'), 'from backend');
  let sendID = '';
  if (id) sendID = id + '/';
  return new Promise((resolve, reject) => {
    request
      .get({
        url: `${url}/${modelName}/${sendID}`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Got ' + modelName + ' with id ' + (id || 'noID') + ' from backend'));
  });
};

API.postModel = (modelName, token, body) => {
  logger.info('Sending POST request with', body, 'to', modelName);
  return new Promise((resolve, reject) =>
    request
      .post({
        url: `${url}/${modelName}`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully POSTed ' + modelName + ' with ' + JSON.stringify(body) + ' to backend')));
};

API.putModel = (modelName, id, token, body) => {
  logger.info('Sending PUT request with ', body, 'to', modelName, 'with ID', id);
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({ error_description: 'No ID specified' });
      return;
    }

    request
      .put({
        url: `${url}/${modelName}/${(id)}/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully PUT ' + modelName + ' with id ' + id + ' and data ' + JSON.stringify(body) + ' to backend'));
  });
};

API.delModel = function (modelName, token, id) {
  logger.info('Sending DELETE request on', modelName, ' with ID', id);
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({ error_message: 'No ID specified' });
      return;
    }

    request
      .del({
        url: `${url}/${modelName}/${id}`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully DELETEed ' + modelName + ' with ID ' + id));
  });
};

API.createUser = function (email, password) {
  logger.info('Trying to create user with email', email);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/user/`,
        auth: {
          user: config.api.client_id,
          pass: config.api.client_secret
        },
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      }, handleResponse(resolve, reject, 'Successfully created user with email ' + email + ' in' +
        ' backend'));
  });
};

API.uploadFile = function (file, fileType = 'image') {
  if (fileType === 'image') {
    // do nothing
  } else if (fileType === 'IMAGE') {
    fileType = 'image';
  } else if (fileType === 'VIDEO') {
    fileType = 'video';
  } else {
    logger.warn(`unknown file type '${fileType}'. Trying to use raw upload`);
    fileType = 'raw';
  }

  return new Promise((resolve, reject) => {
    return cloudinary.v2.uploader.upload_stream({
      resource_type: fileType
    }, (err, res) => {
      if (err) reject(err); else resolve(res);
    }).end(file.buffer);
  });
};

API.getPaymentToken = (invoiceID, token) => {
  logger.info('Trying to get payment token for invoice', invoiceID, 'from backend');
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/invoice/${invoiceID}/payment/braintree/client_token/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Got payment token for invoice ' + invoiceID + ' from backend'));
  });
};

API.checkoutPayment = (invoiceID, token, data) => {
  logger.info('Trying to checkout for invoice', invoiceID);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/invoice/${invoiceID}/payment/braintree/checkout/`,
        auth: { bearer: token.access_token },
        form: data
      }, handleResponse(resolve, reject, 'Successfully checked out invoice' + invoiceID));
  });
};

API.getInviteByToken = (token) => {
  logger.info('Trying to get invite by token', token);
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/user/invitation`,
        qs: {
          token: token
        }
      }, handleResponse(resolve, reject, 'Successfully got invite by token ' + token));
  });
};

API.inviteUser = (token, eventID, teamID, email) => {
  logger.info('Trying to invite user to team', teamID, ' with email ', email);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/event/${eventID}/team/${teamID}/invitation/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify({ email: email }),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully invited ' + email + ' to team ' + teamID));
  });
};

API.activateUser = (token) => {
  logger.info('Trying to activate user with token', token);
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/activation`,
        qs: {
          token: token
        }
      }, handleResponse(resolve, reject, 'Successfully activated user with token ' + token));
  });
};

API.general = {};

API.general.get = (modelURL) => {

  logger.info('Trying to get', modelURL, 'from backend');
  return new Promise((resolve, reject) => {
    request.get({
      url: `${url}${modelURL}`
    }, handleResponse(resolve, reject, 'Got ' + modelURL + ' from backend'));
  });

  /*
   return cache.getObject(modelURL, function () {

   });
   */
};

API.sponsoring = {};

API.sponsoring.create = (token, event, team, body) => {
  logger.info('Trying to create sponsoring for team', team);

  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/event/${event}/team/${team}/sponsoring/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully created sponsoring for team ' + team));
  });
};

API.sponsoring.getByTeam = (eventId, teamId, token) => {
  return new Promise((resolve, reject) => {
    request.get({
      url: `${url}/event/${eventId}/team/${teamId}/sponsoring/`,
      auth: { bearer: token }
    }, handleResponse(resolve, reject, 'Got team sponsorings from backend'));
  });
};

API.sponsoring.getOverviewForTeamProfile = (teamId) => {
  return API.general.get(`/team/${teamId}/sponsoring/`);
};

API.sponsoring.getBySponsor = (token, userId) => {
  logger.info('Trying to get sponsorings from user', userId);

  let mockdata = [{
    'id': 1,
    'amountPerKm': 1,
    'limit': 100,
    'teamId': 1,
    'team': 'namedesteams',
    'sponsorId': userId
  }];

  return new Promise(function (resolve, reject) {
    //return resolve(mockdata);
    request
      .get({
        url: `${url}/user/${userId}/sponsor/sponsoring/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully got sponsorings from user ' + userId));
  });
};

API.sponsoring.changeStatus = (token, eventId, teamId, sponsoringId, status) => {
  logger.info('Trying to change status of  sponsoring ', sponsoringId, 'to', status);

  let mockdata = [{
    'amountPerKm': 1,
    'limit': 100,
    'teamId': teamId,
    'team': 'namedesteams',
    'sponsorId': 1
  }];

  return new Promise(function (resolve, reject) {

    let body = {};
    body.status = status;
    //return resolve(mockdata);
    request
      .put({
        url: `${url}/event/${eventId}/team/${teamId}/sponsoring/${sponsoringId}/status/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully changed status of sponsoring ' + sponsoringId + ' to ' + status));
  });
};

API.sponsoring.reject = (token, eventId, teamId, sponsoringId) => {
  return API.sponsoring.changeStatus(token, eventId, teamId, sponsoringId, 'rejected');
};

API.sponsoring.accept = (token, eventId, teamId, sponsoringId) => {
  return API.sponsoring.changeStatus(token, eventId, teamId, sponsoringId, 'accepted');
};

API.sponsoring.delete = (token, eventId, teamId, sponsoringId) => {
  return API.sponsoring.changeStatus(token, eventId, teamId, sponsoringId, 'withdrawn');
};

API.challenge = {};

API.challenge.getOverviewForTeamProfile = (teamId) => {
  return API.general.get(`/team/${teamId}/challenge/`);
};

API.challenge.create = (token, eventId, teamId, body) => {
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/event/${eventId}/team/${teamId}/challenge/`,
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Challenge created for team' + teamId));
  });
};

API.challenge.getByTeam = (eventId, teamId, token) => {
  return new Promise((resolve, reject) => {
    request.get({
      url: `${url}/event/${eventId}/team/${teamId}/challenge/`,
      auth: { bearer: token }
    }, handleResponse(resolve, reject, 'Got team challenges from backend'));
  });
};

API.challenge.getBySponsor = (token, userId) => {
  logger.info('Trying to get challenges from user', userId);
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/user/${userId}/sponsor/challenge/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully got challenges from user ' + userId));
  });
};

API.challenge.changeStatus = (token, eventId, teamId, challengeId, status) => {
  logger.info('Trying to change status of challenge ', challengeId, 'to', status);
  return new Promise(function (resolve, reject) {

    let body = {};
    body.status = status;
    request
      .put({
        url: `${url}/event/${eventId}/team/${teamId}/challenge/${challengeId}/status/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully changed status of challenge ' + challengeId + ' to ' + status));
  });
};

API.challenge.proof = (token, challengeId, postId) => {
  logger.info('Trying to proof challenge', challengeId);
  return new Promise(function (resolve, reject) {

    let body = {};
    body.status = 'WITH_PROOF';
    body.postingId = postId;
    request
      .put({
        url: `${url}/event/1/team/1/challenge/${challengeId}/status/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully changed status of challenge ' + challengeId + ' to WITH_PROOF'));
  });
};

API.challenge.reject = (token, eventId, teamId, challengeId) => {
  return API.challenge.changeStatus(token, eventId, teamId, challengeId, 'rejected');
};

API.challenge.delete = (token, eventId, teamId, challengeId) => {
  return API.challenge.changeStatus(token, eventId, teamId, challengeId, 'withdrawn');
};

API.challenge.getPostings = (user, challengeId) => {

  let options = {
    url: `${url}/challenge/${challengeId}/posting/`,
  };

  if (user) {
    options.auth = { bearer: user.access_token  };
  }

  return new Promise((resolve, reject) => {
    request.get(options, handleResponse(resolve, reject, 'Got postings for challenge from backend'));
  });
};

API.pwreset = {};

API.pwreset.requestPwReset = (email) => {
  logger.info('Requesting password reset for user', email);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/user/requestreset/`,
        body: JSON.stringify({ email: email }),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'An email with instructions to reset your password was sent to: ' + email));
  });
};

API.pwreset.resetPassword = (email, token, password) => {
  logger.info('Resetting password for user', email);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/user/passwordreset/`,
        body: JSON.stringify({ email: email, token: token, password: password }),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully reset password for: ' + email));
  });
};


API.messaging = {};

API.messaging.createGroupMessage = (token, userIds) => {
  logger.info('Creating new GroupMessage with userIds', userIds);
  return new Promise((resolve, reject) => {

    if (!Array.isArray(userIds) && userIds.length > 0) {
      reject('userIds has to be array to create groupMessage with more than 0 entries');
    }

    request
      .post({
        url: `${url}/messaging/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(userIds),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully created new GroupMessage'));
  });
};

API.messaging.addUsersToGroupMessage = (token, groupMessageId, userIds) => {
  logger.info('Adding Users to GroupMessage with userIds', groupMessageId, userIds);
  return new Promise((resolve, reject) => {

    if (!Array.isArray(userIds) && userIds.length > 0) {
      reject('userIds has to be array to edit groupMessage with more than 0 entries');
    }

    request
      .put({
        url: `${url}/messaging/${groupMessageId}/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(userIds),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully added users to GroupMessage: ' + groupMessageId + ' users: ' + userIds));
  });
};

API.messaging.getGroupMessage = (token, groupMessageId) => {
  logger.info('Getting GroupMessage', groupMessageId);

  return new Promise((resolve, reject) => {
    //return resolve(mockdata);
    request
      .get({
        url: `${url}/messaging/${groupMessageId}/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully got GroupMessage: ' + groupMessageId));
  });
};

API.messaging.addMessageToGroupMessage = (token, groupMessageId, text) => {
  logger.info('Adding Message to GroupMessage', groupMessageId, text);
  return new Promise((resolve, reject) => {

    let body = {};
    body.text = text;
    body.date = Math.floor(new Date().getTime() / 1000);

    request
      .post({
        url: `${url}/messaging/${groupMessageId}/message/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully added Message to GroupMessage: ' + groupMessageId));
  });
};


API.posting = {};

API.posting.createPosting = (token, text, mediaUrl, mediaType, latitude, longitude) => {
  logger.info('Create new Posting', text);
  return new Promise((resolve, reject) => {

    let body = {};
    body.text = text;
    if (mediaUrl) body.media = {
      url: mediaUrl,
      type: mediaType
    };
    if (latitude && longitude) {
      body.postingLocation = {};
      body.postingLocation.latitude = latitude;
      body.postingLocation.longitude = longitude;
    }
    body.date = Math.floor(new Date().getTime() / 1000);
    request
      .post({
        url: `${url}/posting/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully created Posting: ' + text + ' - ' + mediaUrl));
  });
};

API.posting.getAllPostings = (token, page) => {
  logger.info('Getting all postings ');

  let options = {
    url: `${url}/posting/`,
    qs: {}
  };

  if (token) options.auth = { bearer: token.access_token };

  if (token) options.qs.userid = token.me.id;
  if (page) options.qs.page = page;

  return new Promise((resolve, reject) => {
    request.get(options, handleResponse(resolve, reject, 'Successfully got all postings'));
  });
  /*
   return cache.getObject(`/posting/${queryString}`, function () {

   });
   */
};

API.posting.getPostingsForEvent = (events, token, page) => {

  // request.debug = true;
  logger.info(`Requesting postings for events ${events} and page ${page}`);

  let options = {
    url: `${url}/posting/`,
    qs: {
      event: events
    },
    useQuerystring: true
  };

  if (token) options.auth = { bearer: token.access_token };
  if (token) options.qs.userid = token.me.id;
  if (page) options.qs.page = page;

  return new Promise((resolve, reject) => {
    request.get(options, handleResponse(resolve, reject, `Got postings for events ${events} and page ${page}`));
  });

};

API.posting.getPosting = (postingId, token) => {
  let options = {
    url: `${url}/posting/${postingId}/`
  };

  if (token) options.auth = { bearer: token.access_token };
  if (token) options.qs = { userid: token.me.id };

  return new Promise((resolve, reject) => {
    request.get(options, handleResponse(resolve, reject, 'Successfully got Posting: ' + postingId));
  });
};

API.posting.getPostingIdsSince = (postingId) => {
  return API.general.get(`/posting/get/since/${postingId}/`);
};

API.posting.getPostingsByHashtag = (hashtag, token) => {
  let options = {
    url: `${url}/posting/hashtag/${hashtag}/`
  };

  if (token) options.auth = { bearer: token.access_token };
  if (token) options.qs = { userid: token.me.id };

  return new Promise((resolve, reject) => {
    request.get(options, handleResponse(resolve, reject, 'Successfully got Postings by Hashtag: ' + hashtag));
  });
};

API.posting.createComment = (token, postingId, text) => {
  logger.info('Create new Comment for Posting', postingId, text);
  return new Promise((resolve, reject) => {

    let body = {};
    body.text = text;
    body.date = Math.floor(new Date().getTime() / 1000);

    request
      .post({
        url: `${url}/posting/${postingId}/comment/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully created Comment for Posting: ' + postingId));
  });
};

API.posting.createLike = (token, postingId) => {
  logger.info('Create new Like for Posting', postingId);
  return new Promise((resolve, reject) => {

    let body = {};
    body.date = Math.floor(new Date().getTime() / 1000);

    request
      .post({
        url: `${url}/posting/${postingId}/like/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully created Like for Posting: ' + postingId));
  });
};

API.posting.deleteLike = (token, postingId) => {
  logger.info('Delete like for posting', postingId);
  return new Promise((resolve, reject) => {

    request
      .delete({
        url: `${url}/posting/${postingId}/like/`,
        auth: { bearer: token.access_token },
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully deleted Like for Posting: ' + postingId));
  });
};

API.posting.getLikesForPosting = (postingId) => {
  return API.general.get(`/posting/${postingId}/like/`);
};


API.team = {};

API.team.get = function (teamId) {
  return API.general.get(`/event/1/team/${teamId}/`);
};

API.team.getFee = function (teamId, token) {
  let options = {
    url: `${url}/team/${teamId}/startingfee`,
    auth: { bearer: token.access_token }
  };

  return new Promise((resolve, reject) => {
    request.get(options, handleResponse(resolve, reject, 'Successfully got the Team Fee'));
  });
};

API.team.getPostings = function (token, teamId, page) {

  logger.info('Getting all postings ');

  let options = {
    url: `${url}/event/1/team/${teamId}/posting/`,
    qs: {}
  };

  if (token) options.auth = { bearer: token.access_token };

  if (token) options.qs.userid = token.me.id;
  if (page) options.qs.page = page;

  return new Promise((resolve, reject) => {
    request.get(options, handleResponse(resolve, reject, 'Successfully got all postings'));
  });
};

API.team.getDistance = function (teamId) {
  return API.general.get(`/event/1/team/${teamId}/distance/`);
};

API.team.getLocations = function (teamId) {
  return API.general.get(`/event/1/team/${teamId}/location/?perTeam=100`);
};

API.team.getDonations = function (teamId) {
  return API.general.get(`/event/1/team/${teamId}/donatesum/`);
};

API.team.getAllByEvent = function (eventId) {
  return API.general.get(`/event/${eventId}/team/`);
};

API.event = {};

API.event.get = function (eventId) {
  return API.general.get(`/event/${eventId}/`);
};

API.event.all = function () {
  return API.general.get('/event/');
};

API.event.allActiveInfo = (activeEvents) => co(function *() {
  let allEvents = yield API.event.all();
  allEvents = allEvents.map(e => {
    if (!activeEvents || activeEvents.length === 0) {
      e.isActive = e.isCurrent;
    } else {
      e.isActive = _.includes(activeEvents, e.id);
    }
    return e;
  });

  activeEvents = allEvents.filter(e => e.isActive).map(e => e.id);
  let filteredEvents = allEvents.filter(e => _.includes(activeEvents, e.id));

  let allByBrand = {};
  allEvents.forEach(e => {
    let key = e.brand;
    allByBrand[key] = allByBrand[key] || [];
    allByBrand[key].push(e);
  });

  let countEvents = {};
  Object.keys(allByBrand).map(brand => countEvents[brand] = allByBrand[brand].length);

  let allSameBrand = filteredEvents.every(e => e.brand === filteredEvents[0].brand);
  let allOfBrand = allSameBrand && filteredEvents.length === countEvents[filteredEvents[0].brand];
  let allCurrent = filteredEvents.every(e => e.isCurrent);
  let hasActiveAfterStart = filteredEvents.filter(e => e.isActive && e.date * 1000 < new Date().getTime()).length > 0;
  let allOfCurrent = allOfBrand && allCurrent;

  var eventString = filteredEvents.map(e => {
    return `${e.brand} ${e.city}`;
  }).join(' & ');

  if (allSameBrand) {
    let eventCities = filteredEvents.map(e => e.city).join(' & ');
    eventString = `${filteredEvents[0].brand} ${eventCities}`;
  }

  if (allOfBrand) eventString = filteredEvents[0].brand;

  return {
    activeEvents: activeEvents,
    allByBrand: allByBrand,
    allSameBrand: allSameBrand,
    allOfBrand: allOfBrand,
    allCurrent: allCurrent,
    allOfCurrent: allOfCurrent,
    hasActiveAfterStart: hasActiveAfterStart,
    events: filteredEvents,
    eventString: eventString
  };
}).catch(ex => {
  throw ex;
});

API.event.getDonateSum = function (eventId) {
  return API.general.get(`/event/${eventId}/donatesum/`);
};

API.event.getDistance = function (eventId) {
  return API.general.get(`/event/${eventId}/distance/`);
};

API.user = {};

API.user.get = function (userId) {
  return API.general.get(`/user/${userId}/`);
};

API.user.search = function (searchString) {
  logger.info('Searching for users with string: ', searchString);

  return new Promise((resolve, reject) => {
    request
      .get({
        url: `${url}/user/search/${searchString}/`
      }, handleResponse(resolve, reject, 'Successfully got all users for string: ' + searchString));
  });
};

API.location = {};

API.location.getByTeam = (teamId) => {
  return API.general.get(`/event/1/team/${teamId}/location/`);
};

API.location.getByEvent = (eventId) => {
  return API.general.get(`/event/${eventId}/location/`);
};

API.admin = {};

API.admin.deletePosting = (token, postingId) => {

  logger.info('Deleting Posting with Id: ', postingId);

  return new Promise((resolve, reject) => {
    request
      .delete({
        url: `${url}/posting/${postingId}/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully deleted Posting: ' + postingId));
  });
};

API.admin.deleteMedia = (token, mediaId) => {

  logger.info('Deleting Media with Id: ', mediaId);

  return new Promise((resolve, reject) => {
    request
      .delete({
        url: `${url}/media/${mediaId}/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully deleted Media: ' + mediaId));
  });
};

API.admin.deleteComment = (token, commentId, postingId) => {

  if (!postingId) {
    return Promise.reject('Missing postingID');
  }

  logger.info(`Deleting comment with id ${commentId} and postingId ${postingId}`);

  return new Promise((resolve, reject) => {
    request
      .delete({
        url: `${url}/posting/${postingId}/comment/${commentId}/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully deleted Comment: ' + commentId));
  });
};

API.admin.challengeProof = (token, challengeId, postId) => {
  logger.info('Trying to proof challenge', challengeId);
  return new Promise(function (resolve, reject) {
    let body = {};
    body.status = 'WITH_PROOF';
    body.postingId = postId;
    request
      .post({
        url: `${url}/admin/challenge/${challengeId}/proof/`,
        auth: { bearer: token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully changed status of challenge ' + challengeId + ' to WITH_PROOF'));
  });
};

API.invoice = {};

API.invoice.getAll = (token) => {
  logger.info('Getting all invoices');
  return new Promise((resolve, reject) => {
    request
      .get({
        url: `${url}/invoice/sponsoring/admin/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully got all invoices'));
  });
};

API.invoice.getByTeam = (token, teamId) => {
  logger.info('Getting invoices for team', teamId);
  return new Promise((resolve, reject) => {
    request
      .get({
        url: `${url}/invoice/sponsoring/${teamId}/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully got all invoices for team ' + teamId));
  });
};

API.invoice.getBySponsor = (token) => {
  logger.info('Getting invoices for sponsor');
  return new Promise((resolve, reject) => {
    request
      .get({
        url: `${url}/invoice/sponsoring/`,
        auth: { bearer: token.access_token }
      }, handleResponse(resolve, reject, 'Successfully got all invoices for sponsor'));
  });
};

API.invoice.addAmount = (token, invoiceId, amount) => {
  logger.info('Adding payment to invoice', invoiceId, 'with amount', amount);
  return new Promise((resolve, reject) => {
    request
      .post({
        url: `${url}/invoice/${invoiceId}/payment/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify({
          amount: amount
        }),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully added ' + amount + '€ to invoice' + invoiceId));
  });
};

API.invoice.create = (token, body) => {
  logger.info('Add invoice to team', body.teamId, 'with amount', body.amount);
  return new Promise((resolve, reject) => {
    request
      .post({
        url: `${url}/invoice/sponsoring/`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' }
      }, handleResponse(resolve, reject, 'Successfully added  invoice with ' + body.amount + '€ to team ' + body.teamId));
  });
};

function handleResponse(resolve, reject, msg) {
  return (error, response, body) => {
    if (error) {
      logger.error(error);
      reject(error);
    } else {
      if (response.statusCode.toString().match(/^2\d\d$/)) {
        if (!process.env.NODE_ENVIRONMENT === 'prod') logger.info(msg);
        try {
          if (body === '' || body === 'done') body = '{}';
          resolve(JSON.parse(body));
        } catch (ex) {
          resolve(body);
          logger.warn('Could not parse JSON', ex);
          reject(ex);
        }
      } else {
        if (!process.env.NODE_ENVIRONMENT === 'prod') logger.error(body);
        try {
          reject(JSON.parse(body));
        } catch (ex) {
          logger.error(ex);
          reject(ex);
        }
      }
    }
  };
}

module.exports = API;
