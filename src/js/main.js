'use strict';
require('./base.js');
const $ = require('jquery');
var videoPlayer = require('./videoplayer.js');

$(document).ready(function() {
  videoPlayer('#btnIntroVideo', '#modalIntroVideo');
});
