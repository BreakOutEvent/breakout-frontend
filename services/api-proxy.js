'use strict';

/**
 * Backend-API service.
 * @type {*|co}
 */

const co = require('co');
const request = require('request');
const crequest = require('co-request');
const config = requireLocal('config/config.js');

const url = `${config.api.protocol}://${config.api.url}`;

Object.keys(config).forEach(k => {
  if (!config[k])
    throw new Error(`No config entry found for ${k}`);
});

var API = {};

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
  return new Promise((resolve, reject)=> {
      request
        .get({
          url: `${url}/${modelName}/${sendID}`,
          auth: { bearer: token.access_token }
        }, handleResponse(resolve, reject, 'Got ' + modelName + ' with id ' + (id || 'noID') + ' from backend'));
    }
  );
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
      }, handleResponse(resolve, reject, 'Successfully POSTed ' + modelName + ' with ' + JSON.stringify(body) + ' to backend'))
  );
};

API.putModel = (modelName, id, token, body) => {
  logger.info('Sending PUT request with ', body, 'to', modelName, 'with ID', id);
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({ error_description: 'No ID specified' });
      return;
    }

    console.log(body, token);
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

API.uploadPicture = function (file, mediaObj) {
  logger.info('Trying to upload file with id', mediaObj.id);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `https://${config.media_url}`,
        headers: { 'X-UPLOAD-TOKEN': mediaObj.uploadToken },
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
      }, handleResponse(resolve, reject, 'Successfully uploaded file with id ' + mediaObj.id + ' to backend'));
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
  logger.info('Trying to get', modelURL ,'from backend');
  return new Promise((resolve, reject)=> {
      request
        .get({
          url: `${url}${modelURL}`
        }, handleResponse(resolve, reject, 'Got ' + modelURL + ' from backend'));
    }
  );
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

API.sponsoring.getByTeam = (eventId, teamId) => {
  logger.info('Trying to get sponsorings for team', teamId);

  let mockdata = [{
    "id": 1,
    "amountPerKm": 1,
    "limit": 100,
    "teamId": teamId,
    "team": "namedesteams",
    "sponsorId": 1
  }];

  return new Promise(function (resolve, reject) {
    //return resolve(mockdata);
    request
      .get({
        url: `${url}/event/${eventId}/team/${teamId}/sponsoring/`
      }, handleResponse(resolve, reject, 'Successfully got sponsorings for team ' + teamId));
  });
};

API.sponsoring.getBySponsor = (token, userId) => {
  logger.info('Trying to get sponsorings from user', userId);

  let mockdata = [{
    "id": 1,
    "amountPerKm": 1,
    "limit": 100,
    "teamId": 1,
    "team": "namedesteams",
    "sponsorId": userId
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
    "amountPerKm": 1,
    "limit": 100,
    "teamId": teamId,
    "team": "namedesteams",
    "sponsorId": 1
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
  return API.sponsoring.changeStatus(token, eventId, teamId, sponsoringId, "rejected");
};

API.sponsoring.accept = (token, eventId, teamId, sponsoringId) => {
  return API.sponsoring.changeStatus(token, eventId, teamId, sponsoringId, "accepted");
};

API.sponsoring.delete = (token, eventId, teamId, sponsoringId) => {
  return API.sponsoring.changeStatus(token, eventId, teamId, sponsoringId, "withdrawn");
};

API.challenge = {};

API.challenge.create = (token, eventId, teamId, body) => {
  console.log(`${url}/event/${eventId}/team/${teamId}/challenge/`);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/event/${eventId}/team/${teamId}/challenge/`,
        body: JSON.stringify(body),
        headers: {'content-type': 'application/json'},
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Challenge created for team' + teamId));
  });
};

API.challenge.getByTeam = (eventId, teamId) => {
  logger.info('Trying to get challenge for team', teamId);
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/event/${eventId}/team/${teamId}/challenge/`
      }, handleResponse(resolve, reject, 'Successfully got sponsorings for team ' + teamId));
  });
};

API.challenge.getBySponsor = (token, userId) => {
  logger.info('Trying to get challenges from user', userId);
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/user/${userId}/sponsor/challenge/`,
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Successfully got challenges from user ' + userId));
  });
};

API.challenge.changeStatus = (token, eventId, teamId, challengeId, status) => {
  logger.info('Trying to change status of  sponsoring ', challengeId, 'to', status);
  return new Promise(function (resolve, reject) {

    let body = {};
    body.status = status;
    request
      .put({
        url: `${url}/event/${eventId}/team/${teamId}/challenge/${challengeId}/status/`,
        auth: {bearer: token.access_token},
        body: JSON.stringify(body),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'Successfully changed status of sponsoring ' + challengeId + ' to ' + status));
  });
};

API.challenge.reject = (token, eventId, teamId, challengeId) => {
  return API.challenge.changeStatus(token, eventId, teamId, challengeId, "rejected");
};

API.challenge.accept = (token, eventId, teamId, challengeId) => {
  return API.challenge.changeStatus(token, eventId, teamId, challengeId, "accepted");
};

API.challenge.delete = (token, eventId, teamId, challengeId) => {
  return API.challenge.changeStatus(token, eventId, teamId, challengeId, "withdrawn");
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

API.team = {};

API.team.get = function (teamId) {
  return API.general.get(`/event/1/team/${teamId}/`);
};

API.event = {};

API.event.get = function (eventId) {
  return API.general.get(`/event/${eventId}/`);
};

API.event.all = function (eventId) {
  return API.general.get(`/event/`);
};

function handleResponse(resolve, reject, msg) {
  return (error, response, body) => {
    if (error) {
      logger.error(error);
      throw error;
    } else {
      if (response.statusCode.toString().match(/^2\d\d$/)) {
        if (!process.env.NODE_ENVIRONMENT === 'prod') logger.info(msg);
        try {
          if (body === '') body = '{}';
          resolve(JSON.parse(body));
        } catch (ex) {
          resolve(body);
          console.dir(body);
          logger.warn('Could not parse JSON', ex);
        }
      } else {
        if (!process.env.NODE_ENVIRONMENT === 'prod') logger.error(body);
        try {
          reject(JSON.parse(body));
        } catch (ex) {
          console.dir(body);
          logger.error(ex);
        }
      }
    }
  };
}

module.exports = API;
