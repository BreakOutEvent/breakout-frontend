'use strict';
require('./base.js');
var videoPlayer = require('./videoplayer.js');

$(document).ready(function() {
  videoPlayer('#btnIntroVideo', '#modalIntroVideo');
});
