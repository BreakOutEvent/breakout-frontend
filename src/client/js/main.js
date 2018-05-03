'use strict';
require('./base.js');
const $ = require('jquery');

let videoPlayer = require('./videoplayer.js');

$(document).ready(function () {
  videoPlayer('#btnIntroVideo', '#modalIntroVideo');

  $('#boSelectEvents').on('changed.bs.select', function () {

    var selectedIds = $('#boSelectEvents select').val();

    $.post('/liveblog/chooseEvent/', {
      eventIds: selectedIds
    }).success(function () {
      location.reload();
    });
  });
});