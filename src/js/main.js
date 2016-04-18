'use strict';
require('./base.js');
require('./registration.js');
var videoPlayer = require('./videoplayer.js');

$(document).ready(function() {
  videoPlayer('#btnIntroVideo', '#modalIntroVideo');
});
