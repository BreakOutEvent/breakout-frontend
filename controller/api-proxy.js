'use strict';

const request = require('request');

const config = {
  clientID: process.env.FRONTEND_API_CLIENTID,
  clientSecret: process.env.FRONTEND_API_CLIENTSECRET,
  URL: process.env.FRONTEND_API_URL,
  protocol: 'https'
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
          client_id: config.clientID,
          client_secret: config.clientSecret,
          username: username,
          password: password,
          grant_type: 'password'
        },
        auth: {
          user: config.clientID,
          pass: config.clientSecret
        }
      }, handleResponse(resolve, reject, 'Authenticated user successfully' + username))
  });
};

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
  logger.info('Trying to get', modelName, 'with id', id, 'from Backend');
  return new Promise((resolve, reject)=> {
      request
        .get({
          url: `${url}/${modelName}/${(id || '')}`,
          auth: {bearer: token.access_token}
        }, handleResponse(resolve, reject, 'Got ' + modelName + ' with id ' + (id || 'noID') + ' from Backend'))
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
      }, handleResponse(resolve, reject, 'Successfully POSTed ' + modelName + ' with ' + JSON.stringify(body) + ' to Backend'))
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
      }, handleResponse(resolve, reject, 'Successfully PUT ' + modelName + ' with id ' + id + ' and data ' + JSON.stringify(body) + ' to Backend'));
  });
};

API.delModel = function (modelName, token, id) {
  logger.info('Sending DELETE request on',modelName,' with ID', id);
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
  logger.info('Trying to create user with email',email);
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
      }, handleResponse(resolve, reject, 'Successfully created user with email ' + email + ' in Backend'));
  });
};

function handleResponse(resolve, reject, msg) {
  return (error, response, body) => {
    if (error) {
      throw error;
    } else {
      if (response.statusCode.toString().match(/^2\d\d$/)) {
        logger.info(msg);
        resolve(JSON.parse(body));
      } else {
        //console.log(JSON.parse(body), response.statusCode);
        reject(JSON.parse(body));
      }
    }
  };
}

module.exports = API;
