const $ = require('jquery');

// Register listeners for video section play button and link
$(function () {
  $('.trigger-play').click(function () {
    $('#landingpage-video-before').hide();
    $('#video-bg').hide();
    $('#landingpage-video').show();
    $('iframe#landingpage-video-iframe').attr('src', $('iframe#landingpage-video-iframe').attr('src').replace('autoplay=0', 'autoplay=1'));
  });
});

