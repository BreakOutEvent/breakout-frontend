const Instafeed = require('instafeed.js');
const $ = require('jquery');

var feed = new Instafeed({
  get: 'user',
  userId: '3120245646',
  clientId: '5d325f2ba927465d9c3933be01ee870c',
  accessToken: '244409476.ba4c844.894a51890b7e4e4cbf46662b35125d3d',
  resolution: 'standard_resolution',
  template: '<div class="instaimage" style="background-image: url(\'\{{image}}\');"><a href="https://www.instagram.com/breakout_ev/"><span class="instaCaption">\{{caption}}</span><span class="instHover"></span></div></a>',
  limit: 15
});


feed.run();

// Register listeners for video section play button and link
$(function () {
  $('.trigger-play').click(function () {
    $('#landingpage-video-before').hide();
    $('#video-bg').hide();
    $('#landingpage-video').show();
    $('iframe#landingpage-video-iframe').attr('src', $('iframe#landingpage-video-iframe').attr('src').replace('autoplay=0', 'autoplay=1'));
  });
});

