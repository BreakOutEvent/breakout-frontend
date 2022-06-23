'use strict';

const $ = require('jquery');
var sanityCheck = require('./helpers').sanityCheck;
var toggleLoading = require('./helpers').toggleLoading;


$(document).ready(() => {
  $('#profilePic').change(function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('#profile_form .bo-reg-uploadInputWrapper')
          .css('background-image', 'url(' + e.target.result + ')');
        $('#profile_form .registration-picture-icon').hide();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  $('#teamPic').change(function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('#team_form .bo-reg-uploadInputWrapper')
          .css('background-image', 'url(' + e.target.result + ')');
        $('#team_form .registration-picture-icon').hide();
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
  $('#newPassword, #confirmNewPassword').on('keyup', function () {
    const confirmNewPasswordValue = $('#confirmNewPassword').val();
    if (!confirmNewPasswordValue) return;
    const matches = $('#newPassword').val() === confirmNewPasswordValue;
    $('#confirmNewPasswordContainer')[matches ? 'removeClass' : 'addClass']('has-error');
  });

  $(function () {
    $('#delete_user').click(function () {
      var result = confirm('Sind Sie sicher, dass Sie Ihr Konto löschen möchten?\nDann werden Ihre personenbezogenen Daten gelöscht und Ihre Beiträge auf der Website anonymisiert.');
      const accessToken = window.boUserData.access_token;
      const user = window.boUserData.me.id;
      const apiUrl = window.boClientConfig.baseUrl;

      if (result == true) {
        fetch(`${apiUrl}/user/${user}/`, {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${accessToken}`
          },
        })
          .then(res => {
            if (res.ok) {
              alert('Ihr Konto wurde erfolgreich gelöscht!\nIhre Daten werden überall anonymisiert.');
              return window.location.href = '/logout';
            }
            else {
              alert('Es gab ein Problem bei der Löschung Ihres Kontos.');
            }
            return res;
          });
      }
      else {
        return false;
      }
    });
  });

  $('#profile_form').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('profile_form')) {

      if (!($('#profilePic').length && $('#profilePic')[0].files &&
        $('#profilePic')[0].files[0])) {

        //dirty safari hack
        $('#profilePic').remove();
      }

      var data = new FormData($('#profile_form')[0]);
      data.set('newsletter', data.has('newsletter'));

      toggleLoading('#profile_CTA');
      $.ajax({
        url: '/participant',
        type: 'POST',
        cache: false,
        processData: false,
        contentType: false,
        data: data
      }).success(function () {
        $('#result_profile')
          .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
      }).error(function (err) {
        console.log(err);
        const errorText = err && err.responseJSON && err.responseJSON.error === 'Current password is wrong'
          ? 'Speichern fehlgeschlagen, da aktuelles Passwort nicht übereinstimmt!'
          : 'Speichern fehlgeschlagen';

        $('#result_profile')
          .html(`<div class="alert alert-danger">${errorText}!</div>`);
      }).always(() => {
        toggleLoading('#profile_CTA');
      });
    }
  });


  $('#participant_form').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('participant_form')) {
      var data = new FormData($('#participant_form')[0]);

      toggleLoading('#participant_CTA');
      $.ajax({
        url: '/participant',
        type: 'POST',
        cache: false,
        processData: false,
        contentType: false,
        data: data
      }).success(function () {
        $('#result_participant')
          .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
      }).error(function (err) {
        console.log(err);
        $('#result_participant')
          .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
      }).always(() => {
        toggleLoading('#participant_CTA');
      });
    }

  });

  $('#team_form').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('team_form')) {

      if (!($('#teamPic').length && $('#teamPic')[0].files &&
        $('#teamPic')[0].files[0])) {

        //dirty safari hack
        $('#profilePic').remove();
      }

      var data = new FormData($('#team_form')[0]);

      toggleLoading('#team_CTA');
      $.ajax({
        url: '/settings/profile/team',
        type: 'PUT',
        cache: false,
        processData: false,
        contentType: false,
        data: data
      }).success(function () {
        $('#result_team').html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
      }).error(function (err) {
        console.log(err);
        $('#result_team').html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
      }).always(() => {
        toggleLoading('#team_CTA');
      });
    }

  });



  $('#teammembers_form').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('teammembers_form')) {

      var data = new FormData($('#teammembers_form')[0]);
      const result = {};

      for (var entry of data.entries()) {
        result[entry[0]] = entry[1];
      }
      toggleLoading('#teammembers_CTA');
      $.ajax({
        url: '/settings/profile/team/members',
        type: 'POST',
        cache: false,
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify(result)
      }).success(function () {
        $('#result_teammember').html('<div class="alert alert-success">Einladung versendet!</div>');
      }).error(function (err) {
        console.log(err);
        $('#result_teammember').html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
      }).always(() => {
        toggleLoading('#teammembers_CTA');
      });
    }

  });


  $('#sponsor_form').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('sponsor_form')) {
      var data = new FormData($('#sponsor_form')[0]);

      toggleLoading('#sponsor_CTA');
      $.ajax({
        url: '/sponsor',
        type: 'POST',
        cache: false,
        processData: false,
        contentType: false,
        data: data
      }).success(function () {
        $('#result_sponsor')
          .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
      }).error(function (err) {
        console.log(err);
        $('#result_sponsor')
          .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
      }).always(() => {
        toggleLoading('#sponsor_CTA');
      });
    }

  });

});