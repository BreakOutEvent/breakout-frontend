/**
 * Created by Ardobras on 21.05.2016.
 */
var Masonry = require('masonry-layout');
var toggleLoading = require('./helpers.js').toggleLoading;
var sanityCheck = require('./helpers.js').sanityCheck;

$(window).on("load", function () {

  var msnry = null;

  if ($('#teamPosts').length > 0) {
    msnry = new Masonry('#teamPosts', {
      itemSelector: '.bo-team-post'
    });

    var isAuthenticated = false;

    $.post('/team/authenticated')
      .success(function () {
        isAuthenticated = true;
      });

    $('#newPost').on('submit', function (e) {
      e.preventDefault();

      var data = new FormData($('#newPost')[0]);

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
        });
    });

    $('.newComment').on('submit', function (e) {
      e.preventDefault();

      if (!isAuthenticated) {
        return window.location.href = '/login';
      }

      var data = new FormData($(this)[0]);

      $.post('/team/comment/create', {
        id: data.get('newCommentId'),
        text: data.get('newCommentText')
      })
        .success(function () {
          window.location.reload();
        })
        .error(function (err) {
          console.log(err);
          $('#bo-post-result')
            .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
          msnry.layout();
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
            $('.bo-team-upload-wrapper').css('background', '#ccc').css('height', '100px');
            $('.bo-team-post-icon').html('subscriptions').show();
            $('.bo-team-post-upload-text').html(file.name).show();
            $('#bo-team-media-type').val('VIDEO');
            break;
          case 'audio':
            $('.bo-team-upload-wrapper').css('background', '#ccc').css('height', '100px');
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

    if ($('#newPost').length > 0) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      }
      function showPosition(position) {
        if (position.coords) {
          $('#bo-team-latitude').val(position.coords.latitude);
          $('#bo-team-longitude').val(position.coords.longitude);
          $('#bo-team-location').html('lat: ' + position.coords.latitude + ', long: ' + position.coords.longitude)
        }
      }
    }

    $('.bo-card-actions-like').click(function (e) {
      e.preventDefault();
      var $button = $(this);

      if (!isAuthenticated) {
        return window.location.href = '/login';
      }

      $.post('/team/like', { postingId: $button.data('id') })
        .success(function (data) {
          $button.toggleClass('active');
        });
    });

  }
  //TEAM OVERVIEW PAGE
  else if($('#teamProfiles').length > 0) {
    msnry = new Masonry('#teamProfiles', {
      itemSelector: '.bo-team-profile',
      columnWidth: '.bo-team-profile',
      percentPosition: true
    });
    var timeout = null;
    var allTeamsVisible = true;
    $('#boTeamSearch').on('input', function () {
      var s = $(this).val();

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(function () {
        if (s.length > 2) {
          onlyShowSelected(searchForString(s));
          allTeamsVisible = false;
        } else if(!allTeamsVisible) {
          showAll();
          allTeamsVisible = true;
        }
      }, 200);
    });

    function searchForString(string) {
      if (!window.teamData) return null;
      string = string.toLowerCase();

      var d = window.teamData;
      var r = [];
      for (var i = 0; i < d.length; i++) {
        var c = d[i];
        if (
          c.name.toLowerCase().indexOf(string) > -1 ||
          String(c.id).toLowerCase().indexOf(string) > -1
        ) {
          r.push(c);
        } else {
          $.each(c.members, function (i, m) {
            if (
              m.firstname.toLowerCase().indexOf(string) > -1 ||
              m.lastname.toLowerCase().indexOf(string) > -1
            ) {
              r.push(c);
            }
          });
        }
      }
      console.log(r);
      return r;
    }

    function onlyShowSelected(teams) {
      var items = $('.bo-team-profile');

      for (var i = 0; i < items.length; i++) {
        var $o = $(items[i]);
        $o.detach().appendTo('#hiddenTeamSearch');
        for(var j = 0; j < teams.length; j++) {
          if($o.data('id') == teams[j].id) {
            $o.detach().appendTo('#teamProfiles');
            break;
          }
        }
      }
      msnry.layout();
    }

    function showAll() {
      var items = $('.bo-team-profile');

      for(var i = 0; i < items.length; i++) {
        var $o = $(items[i]);
        $o.detach().appendTo('#teamProfiles');
      }
      msnry.layout();
    }
  }

  $('.bo-replace-hashtags').each(function () {
    var hashtags = JSON.parse($(this).attr('data-hashtags'));
    var text = $(this).text();

    for (var i = 0; i < hashtags.length; i++) {
      text = text.replace('#' + hashtags[i], "<a href=\"/hashtag/" + hashtags[i] + "\">#" + hashtags[i] + "</a>");
    }

    $(this).html(text);
  });
});