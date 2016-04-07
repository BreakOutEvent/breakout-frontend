'use strict';

const request = require('request');

const config = {
  clientID: process.env.FRONTEND_API_CLIENTID,
  clientSecret: process.env.FRONTEND_API_CLIENTSECRET,
  URL: process.env.FRONTEND_API_URL,
  protocol: 'https',
};

const url = `${config.protocol}://${config.URL}`;

Object.keys(config).forEach(k => {
  if (!config[k])
    throw new Error(`No config entry found for ${k}`);
});

var API = {};

API.authenticate = (username, password) =>
  new Promise((resolve, reject) =>
    request
      .post({
        url: `${url}/oauth/token`,
        qs: {
          client_id: config.clientID,
          client_secret: config.clientSecret,
          username: username,
          password: password,
          grant_type: 'password',
        },
        auth: {
          user: config.clientID,
          pass: config.clientSecret,
        },
      }, handleResponse(resolve, reject))
  );

API.getCurrentUser = token =>
  new Promise((resolve, reject) =>
    request
      .get({
        url: `${url}/me/`,
        auth: { bearer: token.access_token },
      }, handleResponse(resolve, reject))
  );

API.getModel = (modelName, token, id) =>
  new Promise((resolve, reject)=>
    request
      .get({
        url: `${url}/${modelName}/${(id || '')}`,
        auth: { bearer: token.access_token },
      }, handleResponse(resolve, reject))
  );

API.postModel = (modelName, token, body) =>
  new Promise((resolve, reject) =>
    request
      .post({
        url: `${url}/${modelName}`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
      }, handleResponse(resolve, reject))
  );

API.putModel = function (modelName, id, token, body) {
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({ error_description: 'No ID specified' });
      return;
    }

    request
      .post({
        url: `${url}/${modelName}/${(id)}`,
        auth: { bearer: token.access_token },
        body: JSON.stringify(body),
      }, handleResponse(resolve, reject));
  });
};

API.delModel = function (modelName, token, id) {
  return new Promise(function (resolve, reject) {
    if (!id) {
      reject({ error_message: 'No ID specified' });
      return;
    }

    request
      .del({
        url: `${url}/${modelName}/${id}`,
        auth: { bearer: token.access_token },
      }, handleResponse(resolve, reject));
  });
};

API.createUser = function (email, password) {
  return new Promise(function (resolve, reject) {
    request
      .post({
        url: `${url}/user/`,
        auth: {
          user: config.clientID,
          pass: config.clientSecret,
        },
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      }, handleResponse(resolve, reject));
  });
};

function handleResponse(resolve, reject) {
  return (error, response, body) => {
    if (error) {
      throw error;
    } else {
      if (response.statusCode.toString().match(/^2\d\d$/)) {
        //console.log(JSON.parse(body), response.statusCode);
        resolve(JSON.parse(body));
      } else {
        //console.log(JSON.parse(body), response.statusCode);
        reject(JSON.parse(body));
      }
    }
  };
}

module.exports = API;
