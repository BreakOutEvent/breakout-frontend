'use strict';

var VideoPlayer = function(btnPlay) {
  let $btnPlay = $(btnPlay),
    videoUrl = $btnPlay.attr('data-video') + '?autoplay=1',
    $modal = $($btnPlay.attr('data-target')),
    iframe = $modal.find('iframe');

  $modal.on('show.bs.modal', () => {
    iframe.attr('src', videoUrl);
  });

  //remove source to stop autoplay
  $modal.on('hide.bs.modal', () => {
    iframe.attr('src', '');
  });
};

module.exports = VideoPlayer;