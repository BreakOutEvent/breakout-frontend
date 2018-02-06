'use strict';
require('./base.js');
const $ = require('jquery');

let videoPlayer = require('./videoplayer.js');

$(document).ready(function () {
  videoPlayer('#btnIntroVideo', '#modalIntroVideo');
});

$(window).on('load', function () {
  $('.boSelectCity').on('click', function () {
    var activate = 'false' === $(this).attr('aria-selected');
    $.post('/liveblog/chooseEvent/', {
      activate: activate,
      eventId: $(this).attr('data-tokens')
    }).success(function () {
      location.reload();
    });
  });
});