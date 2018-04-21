const Instafeed = require('instafeed.js');
const $ = require('jquery');

var feed = new Instafeed({
  get: 'user',
  userId: '3120245646',
  clientId: '5d325f2ba927465d9c3933be01ee870c',
  accessToken: '3120245646.5d325f2.0d425d18ec6e4e459683a3493c01c9cd',
  resolution: 'standard_resolution',
  template: '<div class="instaimage" style="background-image: url(\'\{{image}}\');"><a href="https://www.instagram.com/breakout_ev/"><span class="instaCaption">\{{caption}}</span><span class="instHover"></span></div></a>',
  limit: 20
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

