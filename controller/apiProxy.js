var request = require('request');

var config = require('../config/api.json');
var URL = config.protocol + '://' + config.URL;

var API = {};


API.authenticate = function (username, password) {
  return new Promise(function (resolve, reject) {
    request
      .post({
        'url': URL + "/oauth/token",
        qs: {
          'client_id': config.clientID,
          'client_secret': config.clientSecret,
          'username': username,
          'password': password,
          'grant_type': 'password'
        }
      })
      .on('response', function (response) {
        if (response.statusCode == 200) {
          resolve(response.body);
        } else {
          reject(response);
        }
      })
      .on('error', function (error) {
        throw error;
      })
  });
};

module.exports = API;