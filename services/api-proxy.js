'use strict';

/**
 * Backend-API service.
 * @type {*|co}
 */

const co = require('co');
const request = require('request');
const crequest = require('co-request');

const config = {
  clientID: process.env.FRONTEND_API_CLIENTID,
  clientSecret: process.env.FRONTEND_API_CLIENTSECRET,
  URL: process.env.FRONTEND_API_URL,
  mediaURL: process.env.FRONTEND_MEDIA_URL,
  protocol: process.env.FRONTEND_API_PROTOCOL || 'https'
};

const url = `${config.protocol}://${config.URL}`;

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
          user: config.clientID,
          pass: config.clientSecret
        },
        form: {username: username, password: password}
      }, handleResponse(resolve, reject, 'Authenticated user ' + username));
  });
};

API.refresh = (user) => co(function*() {
  logger.info('Trying to refresh token for user', user.email);
  const req = yield crequest
    .post({
      url: `${url}/oauth/token`,
      qs: {
        client_id: config.clientID,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: user.refresh_token
      },
      auth: {
        user: config.clientID,
        pass: config.clientSecret
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
      auth: {bearer: user.access_token}
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
        auth: {bearer: token.access_token}
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
          auth: {bearer: token.access_token}
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
        auth: {bearer: token.access_token},
        body: JSON.stringify(body),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'Successfully POSTed ' + modelName + ' with ' + JSON.stringify(body) + ' to backend'))
  );
};

API.putModel = (modelName, id, token, body) => {
  logger.info('Sending PUT request with ', body, 'to', modelName, 'with ID', id);
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({error_description: 'No ID specified'});
      return;
    }

    console.log(body, token);
    request
      .put({
        url: `${url}/${modelName}/${(id)}/`,
        auth: {bearer: token.access_token},
        body: JSON.stringify(body),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'Successfully PUT ' + modelName + ' with id ' + id + ' and data ' + JSON.stringify(body) + ' to backend'));
  });
};

API.delModel = function (modelName, token, id) {
  logger.info('Sending DELETE request on', modelName, ' with ID', id);
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({error_message: 'No ID specified'});
      return;
    }

    request
      .del({
        url: `${url}/${modelName}/${id}`,
        auth: {bearer: token.access_token}
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
          user: config.clientID,
          pass: config.clientSecret
        },
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({email, password})
      }, handleResponse(resolve, reject, 'Successfully created user with email ' + email + ' in' +
        ' backend'));
  });
};

API.uploadPicture = function (file, mediaObj) {
  logger.info('Trying to upload file with id', mediaObj.id);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `https://${config.mediaURL}`,
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
      }, handleResponse(resolve, reject, 'Successfully uploaded file with id ' + mediaObj.id + ' to backend'));
  });
};

API.getPaymentToken = (invoiceID, token) => {
  logger.info('Trying to get payment token for invoice', invoiceID, 'from backend');
  return new Promise(function (resolve, reject) {
    request
      .get({
        url: `${url}/invoice/${invoiceID}/payment/braintree/client_token/`,
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Got payment token for invoice ' + invoiceID + ' from backend'));
  });
};

API.checkoutPayment = (invoiceID, token, data) => {
  logger.info('Trying to checkout for invoice', invoiceID);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/invoice/${invoiceID}/payment/braintree/checkout/`,
        auth: {bearer: token.access_token},
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
        auth: {bearer: token.access_token},
        body: JSON.stringify({email: email}),
        headers: {'content-type': 'application/json'}
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


API.sponsoring = {};



API.sponsoring.getByTeam = (token, eventId, teamId) => {
  logger.info('Trying to get sponsorings for team', teamId);

  let mockdata = [{
    "id":1,
    "amountPerKm": 1,
    "limit": 100,
    "teamId": teamId,
    "team": "namedesteams",
    "sponsorId": 1
  }];

  return new Promise(function (resolve, reject) {
    return resolve(mockdata);
    request
      .get({
        url: `${url}/event/${eventId}/team/${teamId}/sponsoring/`,
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Successfully got sponsorings for team ' + teamId));
  });
};

API.sponsoring.getBySponsor = (token, userId) => {
  logger.info('Trying to get sponsorings from user', userId);

  let mockdata = [{
    "id":1,
    "amountPerKm": 1,
    "limit": 100,
    "teamId": 1,
    "team": "namedesteams",
    "sponsorId": userId
  }];

  return new Promise(function (resolve, reject) {
    return resolve(mockdata);
    request
      .get({
        url: `/user/${userId}/sponsoring/`,
        auth: {bearer: token.access_token}
      }, handleResponse(resolve, reject, 'Successfully got sponsorings from user ' + userId));
  });
};

API.sponsoring.create = (token, eventId, teamId, body) => {
  logger.info('Trying to create sponsoring for team', teamId);



  let mockdata = [{
    "amountPerKm": 1,
    "limit": 100,
    "teamId": teamId,
    "team": "namedesteams",
    "sponsorId": 1
  }];

  return new Promise(function (resolve, reject) {

    if(!body.amountPerKm) return reject("Missing 'amountPerKm' parameter");
    if(!body.limit) return reject("Missing 'limit' parameter");

    return resolve(mockdata);
    request
      .post({
        url: `${url}/event/${eventId}/team/${teamId}/sponsoring/`,
        auth: {bearer: token.access_token},
        body: JSON.stringify(body),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'Successfully created sponsorings for team ' + teamId));
  });
};

API.pwreset = {};

API.pwreset.requestPwReset = (email) => {
  logger.info('Requesting password reset for user', email);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/user/requestreset/`,
        body: JSON.stringify({email: email}),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'An email with instructions to reset your password was sent to: ' + email ));
  });
};

API.pwreset.resetPassword = (email, token, password) => {
  logger.info('Resetting password for user', email);
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/user/passwordreset/`,
        body: JSON.stringify({email: email, token: token, password: password}),
        headers: {'content-type': 'application/json'}
      }, handleResponse(resolve, reject, 'Successfully reset password for: ' + email ));
  });
};


function handleResponse(resolve, reject, msg) {
  return (error, response, body) => {
    if (error) {
      logger.error(error);
      throw error;
    } else {
      if (response.statusCode.toString().match(/^2\d\d$/)) {
        if (!process.env.NODE_ENV === 'production') logger.info(msg);
        try {
          if (body === '') body = '{}';
          resolve(JSON.parse(body));
        } catch (ex) {
          resolve(body);
          console.dir(body);
          logger.warn('Could not parse JSON', ex);
        }
      } else {
        if (!process.env.NODE_ENV === 'production') logger.error(body);
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
