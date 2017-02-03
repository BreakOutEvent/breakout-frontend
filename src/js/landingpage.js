const Instafeed = require('instafeed.js');

var feed = new Instafeed({
  get: 'user',
  userId: '3120245646',
  clientId: '5d325f2ba927465d9c3933be01ee870c',
  accessToken: '3120245646.1677ed0.84f4da0759f343fabc5948167857ecc7',
  resolution: 'standard_resolution',
  template: '<div class="instaimage" style="background-image: url(\'\{{image}}\');"><a href="https://www.instagram.com/breakout_challenge/"><span class="instaCaption">\{{caption}}</span><span class="instHover"></span></div></a>',
  limit: 15
});


feed.run();