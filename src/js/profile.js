/**
 * Created by Ardobras on 04.05.2016.
 */

var sanityCheck = require('./helpers').sanityCheck;
var toggleLoading = require('./helpers').toggleLoading;


$(document).ready(() => {
  $('#profilePic').change(function() {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('#profile_form .bo-reg-uploadInputWrapper').css('background-image', 'url(' + e.target.result + ')');
        $('#profile_form .registration-picture-icon').hide();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  $('#teamPic').change(function() {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $('#team_form .bo-reg-uploadInputWrapper').css('background-image', 'url(' + e.target.result + ')');
        $('#team_form .registration-picture-icon').hide();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });


  $('#profile_form').submit(function (e) {
    e.preventDefault();
    if(sanityCheck('profile_form')) {
      var data = new FormData($('#profile_form')[0]);

      if ($('#profilePic').length && $('#profilePic')[0].files &&
        $('#profilePic')[0].files[0]) {
        data.delete('profilePic');
      }

      toggleLoading('#profile_CTA');
      $.ajax({
          url: '/participant',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
        .success(function() {
          $('#result_profile').html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
        })
        .error(function(err) {
          console.log(err);
          $('#result_profile').html('<div class="alert alert-error">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#profile_CTA');
        });
    }

  });


  $('#participant_form').submit(function (e) {
    e.preventDefault();
    if(sanityCheck('participant_form')) {
      var data = new FormData($('#participant_form')[0]);

      toggleLoading('#participant_CTA');
      $.ajax({
          url: '/participant',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
        .success(function() {
          $('#result_participant').html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
        })
        .error(function(err) {
          console.log(err);
          $('#result_participant').html('<div class="alert alert-error">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#participant_CTA');
        });
    }

  });

  $('#team_form').submit(function (e) {
    e.preventDefault();
    if(sanityCheck('team_form')) {
      var data = new FormData($('#team_form')[0]);

      if ($('#teamPic').length && $('#teamPic')[0].files &&
        $('#teamPic')[0].files[0]) {
        data.delete('teamPic');
      }

      toggleLoading('#team_CTA');
      $.ajax({
          url: '/team',
          type: 'PUT',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
        .success(function() {
          $('#result_team').html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
        })
        .error(function(err) {
          console.log(err);
          $('#result_team').html('<div class="alert alert-error">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#team_CTA');
        });
    }

  })

});