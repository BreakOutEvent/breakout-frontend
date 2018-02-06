'use strict';

var sanityCheck = require('./helpers').sanityCheck;
var toggleLoading = require('./helpers').toggleLoading;

const $ = require('jquery');
$(document).ready(() => {

  $('#profilePic').change(function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('.bo-reg-uploadInputWrapper').css('background-image', 'url(' + e.target.result + ')');
        $('.registration-picture-icon').hide();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });


  $('#forgotPW').click(function () {
    let email = $('#username').val();
    if (email === '') {
      $('#error').html('<div class="alert alert-danger">' +
        'You must enter the email address you registered with, to reset your password!</div>');
    } else {

      toggleLoading('#forgotPW');
      $.post('/request-pw-reset', {
        email: email
      })
        .success(() => {
          $('#success').html('<div class="alert alert-success">' +
            'An email with instructions to reset your password was sent to: ' + email + '</div>');
        })
        .error(err => {
          $('#error').html('<div class="alert alert-danger">' +
            err.responseJSON.error + '</div>');
        })
        .always(() => {
          toggleLoading('#forgotPW');
        });
    }
  });


  $('#resetPwForm').on('submit', e => {
    e.preventDefault();

    if (sanityCheck('resetPwForm')) {
      if ($('#password').val() !== $('#password_repeat').val()) {
        $('#error').html('<div class="alert alert-danger"> ' +
          'The passwords you entered do not match.</div>');
      } else {
        toggleLoading('#mainCTA');
        $.post('/reset-pw', {
          token: $('#token').val(),
          email: $('#email').val(),
          password: $('#password').val()
        })
          .success(data => {
            $('#success').html('<div class="alert alert-success">' + data.success + '</div>');
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


  if ($('#registerForm').length > 0) {

    $('#registerForm').on('submit', e => {
      e.preventDefault();

      if (sanityCheck('registerForm')) {
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

    $('button[name=gender]').click(function () {
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


      if (sanityCheck('registrationForm')) {


        if (!($('#profilePic').length && $('#profilePic')[0].files &&
          $('#profilePic')[0].files[0])) {

          //dirty safari hack
          $('#profilePic').remove();
        }

        var data = new FormData($('#registrationForm')[0]);
        data.append('gender', window.gender);

        toggleLoading('#mainCTA');
        $.ajax({
          url: '/participant',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
          .success(function (result) {
            window.location.href = result.nextURL;
          })
          .error(function (err) {
            console.log(err);
          })
          .always(() => {
            toggleLoading('#mainCTA');
          });
      }
    });
  } else if ($('#teamForm').length > 0) {
    $('#teamForm').on('submit', function (e) {
      e.preventDefault();

      if (sanityCheck('teamForm')) {


        if (!($('#profilePic')[0] && $('#profilePic')[0].files &&
          $('#profilePic')[0].files[0])) {
          
          //dirty safari hack
          $('#profilePic').remove();
        }

        var data = new FormData($('#teamForm')[0]);

        toggleLoading('#mainCTA');
        $.ajax({
          url: '/team-create',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
          .success(function (res) {
            window.location.href = res.nextURL;
          })
          .error(function (err) {
            $('#feedback').html('<div class="alert alert-danger">' +
              err.responseJSON.error.message + '</div>');
          })
          .always(() => {
            toggleLoading('#mainCTA');
          });
      }
    });
  } else if ($('#inviteForm').length > 0) {
    $('#inviteForm').on('submit', function (e) {
      e.preventDefault();

      if (sanityCheck('inviteForm')) {
        var values = {
          email: $('#email').val()
        };

        toggleLoading('#mainCTA');
        $.post('/invite', values)
          .success(function () {
            $('#feedback').html('<div class="alert alert-success">' +
              'Erfolgreich eingeladen!</div>');
            $('#email').val('');
          })
          .error(function (err) {
            $('#feedback').html('<div class="alert alert-danger">' +
              err.responseJSON.error + '</div>');
          })
          .always(() => {
            toggleLoading('#mainCTA');
          });
      }
    });
  } else if ($('#team-invite').length > 0) {
    $('.joinLinkTeam').click(function () {
      const data = {
        team: $(this).attr('data-team'),
        event: $(this).attr('data-event')
      };

      toggleLoading('#mainCTA');
      $.post('/team-invite', data)
        .success(function (res) {
          window.location.href = res.nextUrl;
        })
        .error(function (err) {
          $('#feedback').html('<div class="alert alert-danger">' +
            err.responseJSON.error + '</div>');
        })
        .always(() => {
          toggleLoading('#mainCTA');
        });

    });
  } else if ($('#sponsorForm').length > 0) {
    $('button[name=gender]').click(function () {
      let selection = $(this).val();

      if (selection === window.gender) {
        $('#' + selection).toggleClass('bo-reg-selected-button');
      } else {
        $('#' + selection).addClass('bo-reg-selected-button');
        $('#' + window.gender).removeClass('bo-reg-selected-button');
      }

      window.gender = selection;

    });

    $('#sponsorForm').on('submit', function (e) {
      e.preventDefault();

      if (sanityCheck('sponsorForm')) {

        if (!($('#profilePic')[0] && $('#profilePic')[0].files &&
          $('#profilePic')[0].files[0])) {

          //dirty safari hack
          $('#profilePic').remove();
        }

        var data = new FormData($('#sponsorForm')[0]);
        data.append('gender', window.gender);

        toggleLoading('#mainCTA');
        $.ajax({
          url: '/sponsor',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
          .success(function (res) {
            window.location.href = res.nextURL;
          })
          .error(function (err) {
            $('#feedback').html('<div class="alert alert-danger">' +
              err.responseJSON.error + '</div>');
          })
          .always(() => {
            toggleLoading('#mainCTA');
          });
      }
    });
  }

});
