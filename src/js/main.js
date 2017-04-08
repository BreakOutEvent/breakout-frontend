'use strict';
require('./base.js');
const $ = require('jquery');

let videoPlayer = require('./videoplayer.js');

$(document).ready(function () {
  videoPlayer('#btnIntroVideo', '#modalIntroVideo');
});
