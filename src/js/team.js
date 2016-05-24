/**
 * Created by Ardobras on 21.05.2016.
 */
var Masonry = require('masonry-layout');
var toggleLoading = require('./helpers.js').toggleLoading;
var sanityCheck = require('./helpers.js').sanityCheck;

$(window).on("load", function () {
  var msnry = new Masonry('#teamPosts', {
    itemSelector: '.bo-team-post'
  });

  $('#newPost').on('submit', function (e) {
    e.preventDefault();
    
    var data = new FormData($('#newPost')[0]);

    toggleLoading('#bo-post-cta', true);
    $.ajax({
      url: '/team/post/create',
      type: 'POST',
      cache: false,
      processData: false,
      contentType: false,
      data: data
    })
      .success(function () {
        window.location.reload();
      })
      .error(function (err) {
        console.log(err);
        $('#bo-post-result')
          .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        msnry.layout();
      })
      .always(() => {
        toggleLoading('#bo-post-cta');
      });
  });

  $('#postPic').change(function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      var file = this.files[0];
      var type = file.type.split('/')[0];
      reader.onload = function (e) {

        var image = new Image();
        image.src = e.target.result;

        image.onload = function () {
          // access image size here
          $('.bo-team-upload-wrapper').css('background-image', 'url(' + e.target.result + ')');
          $('.bo-team-upload-wrapper').css('height', +(this.height / this.width) * $('.bo-team-upload-wrapper').width() + 'px');
          $('#bo-team-media-type').val('IMAGE');
          $('.bo-team-post-icon').hide();
          $('.bo-team-post-upload-text').hide();
          msnry.layout();
        };
      };
      switch (type) {
        case 'image':
          reader.readAsDataURL(this.files[0]);
          break;
        case 'video':
          $('.bo-team-upload-wrapper').css('background', '#ccc').css('height','100px');
          $('.bo-team-post-icon').html('subscriptions').show();
          $('.bo-team-post-upload-text').html(file.name).show();
          $('#bo-team-media-type').val('VIDEO');
          break;
        case 'audio':
          $('.bo-team-upload-wrapper').css('background', '#ccc').css('height','100px');
          $('.bo-team-post-icon').html('audiotrack').show();
          $('.bo-team-post-upload-text').html(file.name).show();
          $('#bo-team-media-type').val('AUDIO');
          break;
        default:
          break;
      }
      msnry.layout();
    }
  });

  if($('#newPost').length > 0) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
    function showPosition(position) {
      if(position.coords) {
        $('#bo-team-latitude').val(position.coords.latitude);
        $('#bo-team-longitude').val(position.coords.longitude);
        $('#bo-team-location').html('lat: ' + position.coords.latitude + ', long: ' + position.coords.longitude)
      }
    }
  }

  $('.bo-card-actions-like').click(function (e) {
    e.preventDefault();
    var $button = $(this);
    $.post('/team/like', {postingId: $button.data('id')})
      .success(function (data) {
        $button.toggleClass('active');
      });
  });

});