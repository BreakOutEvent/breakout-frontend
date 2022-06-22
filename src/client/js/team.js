var Masonry = require('masonry-layout');
var Plyr = require('plyr');
var lightbox = require('lightbox2');
var toggleLoading = require('./helpers.js').toggleLoading;
var sanityCheck = require('./helpers.js').sanityCheck;
window.msnry = null;
const $ = require('jquery');
$(window).on('load', function () {

  var players = Plyr.setup();

  if ($('#teamPosts').length > 0) {
    window.msnry = new Masonry('#teamPosts', {
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

      $('.bo-team-upload-progress-wrap').show();
      window.msnry.layout();

      toggleLoading('#bo-post-cta');
      $.ajax({
        url: '/team/post/create',
        type: 'POST',
        cache: false,
        processData: false,
        contentType: false,
        data: data,
        // Custom XMLHttpRequest
        xhr: function () {
          var theXhr = $.ajaxSettings.xhr();
          //Only trigger when we actually upload anything
          if (theXhr.upload) {
            // For handling the progress of the upload
            theXhr.upload.addEventListener('progress', function (e) {
              if (e.lengthComputable) {
                var progress = Math.round((e.loaded * 100) / e.total);
                $('.bo-team-upload-progress-bar').css('left', '-' + (100 - progress) + '%');
                if (progress >= 100) {
                  $('.bo-team-upload-server-processing').show();
                  window.msnry.layout();
                }
              }
            }, false);
          }
          return theXhr;
        }
      }).success(function () {
        window.location.reload();
      }).error(function (err) {
        console.log(err);
        $('#bo-post-result')
          .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        window.msnry.layout();
      });
    });

    $('.newComment').on('submit', function (e) {
      e.preventDefault();

      if (!isAuthenticated) {
        return window.location.href = '/login?return=' + window.location.pathname;
      }

      var data = new FormData($(this)[0]);

      $.post('/team/comment/create', {
        id: data.get('newCommentId'),
        text: data.get('newCommentText')
      }).success(function () {
        window.location.reload();
      }).error(function (err) {
        console.log(err);
        $('#bo-post-result')
          .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        window.msnry.layout();
      });
    });

    $('.adminChallengeProof').on('submit', function (e) {
      e.preventDefault();

      var data = new FormData($(this)[0]);

      $.post('/admin/challengeProof', {
        challengeId: data.get('challengeId'),
        postingId: data.get('postingId')
      }).success(function () {
        window.location.reload();
      }).error(function (err) {
        $('#bo-post-result')
          .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        window.msnry.layout();
      });
    });

    $('#postPic').change(function () {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        var file = this.files[0];
        var type = file.type.split('/')[0];

        // PROGRESS START

        $('.bo-team-upload-progress-wrap').show();

        reader.onprogress = function (event) {
          if (event.lengthComputable) {
            var progress = Math.round((event.loaded * 100) / event.total);
            $('.bo-team-upload-progress-bar').css('left', '-' + (100 - progress) + '%');
          }
        };

        //PROGRESS END

        reader.onload = function (e) {

          //RESET PROGRESS
          $('.bo-team-upload-progress-bar').css('left', '-100%');
          $('.bo-team-upload-progress-wrap').hide();

          var image = new Image();
          image.src = e.target.result;

          image.onload = function () {
            // access image size here
            $('.bo-team-upload-wrapper').css('backgroundImage', 'url(' + e.target.result + ')');
            $('.bo-team-upload-wrapper').css('height', +(this.height / this.width) * $('.bo-team-upload-wrapper').width() + 'px');
            $('#bo-team-media-type').val('IMAGE');
            $('.bo-team-post-icon').hide();
            $('.bo-team-post-upload-text').hide();
            window.msnry.layout();
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
        window.msnry.layout();
      }
    });

    if ($('#newPost').length > 0) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, handleError);
      }
    }

    $('.bo-card-actions-like').click(function (e) {
      e.preventDefault();
      var $button = $(this);

      if (!isAuthenticated) {
        return window.location.href = '/login?return=' + window.location.pathname;
      }

      if($button.hasClass('active')) {
        $.ajax({
          url: '/team/like',
          type: 'DELETE',
          data: {postingId: $button.data('id')},
          success: function(result) {
            $button.toggleClass('active');
            var $likeCount = $button.find('.bo-like-count');
            var count = parseInt($likeCount.text());
            count--;
            $likeCount.text(count);
            if(count === 0) {
              $button.find('.bo-first-like').toggle();
              $button.find('.bo-likes-text').toggle();
            }
          }
        });
      } else {
        $.post('/team/like', {postingId: $button.data('id')})
          .success(function (data) {
            $button.toggleClass('active');
            var $likeCount = $button.find('.bo-like-count');
            var count = parseInt($likeCount.text());
            count++;
            $likeCount.text(count);
            if(count === 1) {
              $button.find('.bo-first-like').toggle();
              $button.find('.bo-likes-text').toggle();
            }
          });
      }
    });

    $('.bo-card-actions-like').on('mouseover', function () {

      var cardLike = $(this);

      if (parseInt(cardLike.find('.bo-like-count').text()) > 0) {
        cardLike.addClass('bo-tooltip');
        cardLike.attr('data-tooltip', 'Lädt...');

        $.get('/team/likes/' + $(this).attr('data-id'), function (data) {

          var add = 0;
          var names = [];
          data.forEach(function (like) {
            if (like.user.firstname && like.user.lastname && names.length < 10) {
              names.push(like.user.firstname + ' ' + like.user.lastname);
            } else {
              add++;
            }
          });

          if (add != 0) {
            names.push('und ' + add + ' weitere Person');
          }

          cardLike.attr('data-tooltip', names.join('\n'));
        });
      }
    });

  }
  //TEAM OVERVIEW PAGE
  else if ($('#teamProfiles').length > 0) {
    window.msnry = new Masonry('#teamProfiles', {
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
        } else if (!allTeamsVisible) {
          showAll();
          allTeamsVisible = true;
        }
      }, 200);
    });

  }

  $('.bo-replace-hashtags').each(function () {
    const text = $(this).text();
    let wrapped = `<span>${text}</span>`;
    wrapped = $(wrapped).text();
    wrapped = wrapped.replace(/(#[\S]*)/g, (a, b) =>
      `<a href='/post/hashtag/${b.slice(1)}'>${b}</a>`);
    $(this).html(wrapped);
  });

  $('.bo-admin-delete').on('click', function () {
    var type = $(this).attr('data-delete-type');
    var id = parseInt($(this).attr('data-id'));
    var postingId = $(this).attr('data-posting-id');

    if (confirm('Möchtest du wirklich das gewählte Element unwiderruflich löschen?')) {
      $.ajax({
        url: '/team/' + type + '/' + id,
        type: 'DELETE',
        data: {
          posting: postingId
        },
        success: function () {
          alert('DELETED!');
          window.location.reload();
        },
        error: function () {
          alert('Es ist ein Fehler beim Löschen aufgetreten');
        }
      });
    }
  });

  lightbox.option({
    'resizeDuration': 200,
    'wrapAround': true
  });
/*
  $(function (){
    $("#bo-user-delete").click(function() {
      var result = confirm('Möchtest du wirklich das gewählte Element unwiderruflich löschen?');
      const accessToken = window.boUserData.access_token;
      const user = window.boUserData.me.id;
      const apiUrl = window.boClientConfig.baseUrl;
      const id = parseInt($(this).attr('data-id'));

      if (result == true) {
        fetch(`${apiUrl}/posting/${user}/comment/${id}`, {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${accessToken}`
          },
        success: function () {
          alert('DELETED!');
          window.location.reload();
        },
        error: function () {
          alert('Es ist ein Fehler beim Löschen aufgetreten');
        }
        })
      }
    })
  })
*/
  if (players) {
    players.forEach(function (instance) {
      instance.on('enterfullscreen', function (event) {
        instance.source({
          sources: [{
            src: event.srcElement.firstChild.parentNode.parentElement.attributes.getNamedItem('data-fullscreen-webm').value,
            type: 'video/webm'
          }, {
            src: event.srcElement.firstChild.parentNode.parentElement.attributes.getNamedItem('data-fullscreen-h264').value,
            type: 'video/mp4'
          }]
        });
      });
    });
  }
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
  return r;
}

function onlyShowSelected(teams) {
  var items = $('.bo-team-profile');

  for (var i = 0; i < items.length; i++) {
    var $o = $(items[i]);
    $o.detach().appendTo('#hiddenTeamSearch');
    for (var j = 0; j < teams.length; j++) {
      if ($o.data('id') == teams[j].id) {
        $o.detach().appendTo('#teamProfiles');
        break;
      }
    }
  }
  window.msnry.layout();
}

function showAll() {
  var items = $('.bo-team-profile');

  for (var i = 0; i < items.length; i++) {
    var $o = $(items[i]);
    $o.detach().appendTo('#teamProfiles');
  }
  window.msnry.layout();
}

function showPosition(position) {
  if (position.coords) {
    if (position.coords.latitude !== 0) {
      $('#bo-team-latitude').val(position.coords.latitude);
    }
    if (position.coords.longitude !== 0) {
      $('#bo-team-longitude').val(position.coords.longitude);
    }
    $('#bo-team-location').html('lat: ' + position.coords.latitude + ', long: ' + position.coords.longitude);
  }
}

function handleError(error) {
  $.get('/location-not-enabled');
  alert('Es scheint, Dein Browser darf Dich nicht orten. Bitte erlaube das Deinem Browser, damit BreakOut die Kilometerspenden berechnen kann und alle Euren Fortschritt sehen können :-). Liebe Grüße aus der BreakOut Zentrale!');
}
