'use strict';

var VideoPlayer = function (btnPlay) {
  var $btnPlay = $(btnPlay),
    videoUrl = $btnPlay.attr('data-video') + '?autoplay=1',
    $modal = $($btnPlay.attr('data-target')),
    iframe = $modal.find('iframe');

  $modal.on('show.bs.modal', function () {
    iframe.attr('src', videoUrl);
  });

  //remove source to stop autoplay
  $modal.on('hide.bs.modal', function () {
    iframe.attr('src', '');
  });
};

module.exports = VideoPlayer;
