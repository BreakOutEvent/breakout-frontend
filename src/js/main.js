'use strict';
require('./base.js');
const $ = require('jquery');

const BreakoutApi = require('./BreakoutApi');
const store = require('store');

var videoPlayer = require('./videoplayer.js');

$(document).ready(function () {
  videoPlayer('#btnIntroVideo', '#modalIntroVideo');

  if ($('#loginForm')) {
    $('#loginForm').submit(function (e) {
      e.preventDefault();
      const username = this.username.value;
      const pw = this.password.value;
      const api = new BreakoutApi('http://localhost:8082', 'breakout_app', '123456789');
      api.login(username, pw)
        .then((data) => {
          store.set('accessToken', data.access_token);
        });
      this.submit();
    });
  }
});
