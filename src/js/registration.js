'use strict';

function sanityCheck() {

  var inputs = $('input,select');

  inputs.each((i, element) => {
    let val = $(element).val();
    //CHECK if its required
    if (!$(element)[0].hasAttribute('required')) return;
    //Check if its a checkbox
    if ($(element).prop('type') === 'checkbox') {
      val = $(element).is(':checked') ? 'true' : '';
    }

    if ($(element).prop('type') === 'file') {
      val = $(element)[0].files && $(element)[0].files[0] ? 'true' : '';
    }
    if (!val || val.trim() === '') {
      $(element).addClass('bo-reg-form-error');
    } else {
      $(element).removeClass('bo-reg-form-error');
    }
  });

  if ($('#registrationForm') && !window.gender) {
    $('button[name=gender]').addClass('bo-reg-form-error');
  } else {
    $('button[name=gender]').removeClass('bo-reg-form-error');
  }

  return !$('.bo-reg-form-error').length;
}


function toggleLoading(button) {

  if ($(button).has('.spinner').length) {
    $(button).children('.spinner').remove();
    $(button).html($(button).children('span.hidden').html());
  } else {
    $(button).html('<span class="hidden">' + $(button).html() + '</span>');
    $(button).append('<div class="spinner"><div class="bounce1"></div>' +
      '<div class="bounce2"></div> <div class="bounce3"></div> </div>');
  }
}

$(document).ready(() => {

  $('#profilePic').change(function() {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('.bo-reg-uploadInputWrapper').css('background-image', 'url(' + e.target.result + ')');
        $('.registration-picture-icon').hide();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  if ($('#registerForm').length > 0) {

    $('#registerForm').on('submit', e => {
      e.preventDefault();

      if (sanityCheck()) {
        if ($('#password').val() !== $('#password_repeat').val()) {
          $('#error').html('<div class="alert alert-danger"> ' +
            'The passwords you entered do not match.</div>');
        } else {
          toggleLoading('#mainCTA');
          $.post('/register', {
              email: $('#email').val(),
              password: $('#password').val()
            })
            .success(data => {
              window.location.href = data.nextUrl;
            })
            .error(err => {
              console.log(err);
              $('#error').html('<div class="alert alert-danger">' +
                err.responseJSON.error + '</div>');
            })
            .always(() => {
              toggleLoading('#mainCTA');
            });
        }
      }
    });

  } else if ($('#registrationForm').length > 0) {
    window.gender = null;

    $('button[name=gender]').click(function() {
      let selection = $(this).val();

      if (selection === window.gender) {
        $('#' + selection).toggleClass('bo-reg-selected-button');
      } else {
        $('#' + selection).addClass('bo-reg-selected-button');
        $('#' + window.gender).removeClass('bo-reg-selected-button');
      }

      window.gender = selection;

    });

    $('#registrationForm').on('submit', e => {
      e.preventDefault();


      if (sanityCheck()) {

        var data = new FormData($('#registrationForm')[0]);
        data.append('gender', window.gender);

        if ($('#profilePic')[0] && $('#profilePic')[0].files &&
          $('#profilePic')[0].files[0]) {
          data.delete('profilePic');
        }

        toggleLoading('#mainCTA');
        $.ajax({
            url: '/participant',
            type: 'POST',
            cache: false,
            processData: false,
            contentType: false,
            data: data
          })
          .success(function(result) {
            window.location.href = result.nextURL;
          })
          .error(function(err) {
            console.log(err);
          })
          .always(() => {
            toggleLoading('#mainCTA');
          });
      }
    });
  } else if ($('#teamForm').length > 0) {
    $('#teamForm').on('submit', function(e) {
      e.preventDefault();

      if (sanityCheck()) {

        var data = new FormData($('#teamForm')[0]);
        console.log(data);

        if ($('#profilePic')[0] && $('#profilePic')[0].files &&
          $('#profilePic')[0].files[0]) {
          data.delete('profilePic');
        }

        toggleLoading('#mainCTA');
        $.ajax({
            url: '/team-create',
            type: 'POST',
            cache: false,
            processData: false,
            contentType: false,
            data: data
          })
          .success(function(res) {
            window.location.href = res.nextURL;
          })
          .error(function(err) {
            $('#feedback').html('<div class="alert alert-danger">' +
               err.responseJSON.error.message + '</div>');
          })
          .always(() => {
            toggleLoading('#mainCTA');
          });
      }
    });
  } else if ($('#inviteForm').length > 0) {
    $('#inviteForm').on('submit', function(e) {
      e.preventDefault();

      if (sanityCheck()) {
        var values = {
          email: $('#email').val()
        };

        toggleLoading('#mainCTA');
        $.post('/invite', values)
          .success(function() {
            $('#feedback').html('<div class="alert alert-success">' +
              'Erfolgreich eingeladen!</div>');
            $('#email').val('');
          })
          .error(function() {
            $('#feedback').html('<div class="alert alert-danger">' +
              'Einladen fehlgeschlagen! Bitte später noch einmal versuchen.</div>');
          })
          .always(() => {
            toggleLoading('#mainCTA');
          });
      }
    });
  } else if($('#team-invite')) {
    $('.joinLinkTeam').click(function() {
      const data = {
        team: $(this).attr('data-team'),
        event: $(this).attr('data-event')
      };

      toggleLoading('#mainCTA');
      $.post('/team-invite', data)
        .success(function(res) {
          window.location.href = res.nextUrl;
        })
        .error(function(err) {
          $('#feedback').html('<div class="alert alert-danger">' +
            err.responseJSON.error + '</div>');
        })
        .always(() => {
          toggleLoading('#mainCTA');
        });

    });
  }

});
