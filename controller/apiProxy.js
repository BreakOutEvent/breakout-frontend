var request = require('request');

var config = {
  URL : 'http://breakout-development.herokuapp.com/'
};

var API = {};


API.authenticate = function (user, pass) {
  request
    .get(config.URL + "")
    .on('response', function(response) {
      console.log(response);
    })
    .on('error', function(error) {
      throw error;
    })
};


module.exports = API;