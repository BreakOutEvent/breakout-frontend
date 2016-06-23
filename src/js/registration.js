'use strict';

var sanityCheck = require('./helpers').sanityCheck;
var toggleLoading = require('./helpers').toggleLoading;

function requestPasswordReset(email) {
  return $.post('/request-pw-reset', {
    email: email
  });
}

function resetPassword(email, newPassword, token) {
  return $.post('/reset-pw', {
    token: token,
    email: email,
    password: newPassword
  });
}

// TODO: Split up data?? Does this make sense here? At least document what is needed
function createTeam(data) {
  return $.ajax({
    url: '/team-create',
    type: 'POST',
    cache: false,
    processData: false,
    contentType: false,
    data: data
  });
}

function register(email, password) {
  return $.post('/register', {
    email: email,
    password: password
  });
}

function becomeParticipant(data) {
  return $.ajax({
    url: '/participant',
    type: 'POST',
    cache: false,
    processData: false,
    contentType: false,
    data: data
  });
}

function becomeSponsor(data) {
  return $.ajax({
    url: '/sponsor',
    type: 'POST',
    cache: false,
    processData: false,
    contentType: false,
    data: data
  });
}

function inviteUser(data) {
  return $.post('/invite', data);
}

function inviteToTeam(data) {
  return $.post('/team-invite', data);
}

function displayError(message) {
  $('#error').html(`<div class="alert alert-danger">${message}</div>`);
}

function displaySuccess(message) {
  $('#success').html(`<div class="alert alert-success">${message}</div>`);
}

function displayErrorInFeedback(message) {
  $('#feedback').html(`<div class="alert alert-danger">${message}</div>`);
}

function displaySuccessInFeedback(message) {
  $('#feedback').html(`<div class="alert alert-success">${message}</div>`);
}

function profilePicCheckAndFix() {
  const profilePicElem = $('#profilePic');
  if (!(profilePicElem.length && profilePicElem[0].files && profilePicElem[0].files[0])) {
    //dirty safari hack
    $('#profilePic').remove();
  }
}

function clickBecomeSponsor(event) {
  event.preventDefault();

  // Sanity check
  if (!sanityCheck('sponsorForm')) {
    //TODO:??
    return;
  }

  profilePicCheckAndFix();

  var data = new FormData($('#sponsorForm')[0]);
  data.append('gender', window.gender);
  toggleLoading('#mainCTA');
  becomeSponsor(data)
    .success(res => window.location.href = res.nextURL)
    .error(err => displaySuccessInFeedback(err.responseJSON.error))
    .always(() => toggleLoading('#mainCTA'));
}

function clickRegister(event) {
  event.preventDefault();

  // Sanity check
  if (!sanityCheck('registerForm')) {
    // TODO: How to handle error
    return;
  }

  // Check PW match
  const password = $('#password').val();
  const passwordRepeat = $('#password_repeat').val();
  if (password !== passwordRepeat) {
    displayError('The passwords you entered do not match.');
    return;
  }

  toggleLoading('#mainCTA');
  const email = $('#email').val();
  register(email, password)
    .success(data => window.location.href = data.nextUrl)
    .error(err => {
      console.log(err);
      displayError(err.responseJSON.error);
    })
    .always(() => toggleLoading('#mainCTA'));
}

function clickRegistration(event) {
  event.preventDefault();

  if (!sanityCheck('registrationForm')) {
    // TODO
    return;
  }

  var data = new FormData($('#registrationForm')[0]);
  data.append('gender', window.gender);

  toggleLoading('#mainCTA');
  becomeParticipant(data)
    .success(result => window.location.href = result.nextURL)
    .error(function (err) {
      // TODO: Display error message to user here??
      console.log(err);
    })
    .always(() => toggleLoading('#mainCTA'));
}

function clickCreateTeam(event) {
  event.preventDefault();

  if (!sanityCheck('teamForm')) {
    // TODO: How do we handle this??
    return;
  }

  profilePicCheckAndFix();

  var data = new FormData($('#teamForm')[0]);

  toggleLoading('#mainCTA');
  createTeam(data)
    .success((res) => window.location.href = res.nextURL)
    .error(err => displayErrorInFeedback(err.responseJSON.error.message))
    .always(() => toggleLoading('#mainCTA'));
}

function clickForgotPassword() {
  let email = $('#username').val();
  if (email === '') {
    displayError('You must enter the email address you registered with, to reset your password!');
    return;
  }

  toggleLoading('#forgotPW');
  requestPasswordReset(email)
    .success(() => displaySuccess('An email with instructions to reset your password was sent to: ' + email))
    .error(err => displayError(err.responseJSON.error))
    .always(() => toggleLoading('#forgotPW'));
}

function clickResetPassword(event) {
  event.preventDefault();

  if (!sanityCheck('resetPwForm')) {
    // TODO: What do we if sanity check fails??
  }

  const password = $('#password').val();
  const passwordRepeat = $('#password_repeat').val();

  console.log('test');

  if (password !== passwordRepeat) {
    displayError('The passwords you entered do not match');
    return;
  }

  toggleLoading('#mainCTA');
  const token = $('#token').val();
  const email = $('#email').val();

  resetPassword(email, password, token)
    .success(data => displaySuccess(data.success))
    .error(err => {
      console.log(err);
      displayError(err.responseJSON.error);
    })
    .always(() => toggleLoading('#mainCTA'));
}

function clickInviteUser(event) {
  event.preventDefault();

  if (!sanityCheck('inviteForm')) {
    //TODO:??
    return;
  }

  var values = {
    email: $('#email').val()
  };

  toggleLoading('#mainCTA');
  inviteUser(values)
    .success(() => {
      displaySuccessInFeedback('Erfolgreich eingeladen');
      $('#email').val('');
    })
    .error(err => displayErrorInFeedback(err.responseJSON.error))
    .always(() => toggleLoading('#mainCTA'));
}

function doSomethingWithGender() {
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
}

function onProfilePicChange(that) {
  if (that.files && that.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $('.bo-reg-uploadInputWrapper').css('background-image', 'url(' + e.target.result + ')');
      $('.registration-picture-icon').hide();
    };
    reader.readAsDataURL(that.files[0]);
  }
}

function clickJoinTeam(that) {
  const data = {
    team: $(that).attr('data-team'),
    event: $(that).attr('data-event')
  };

  toggleLoading('#mainCTA');
  inviteToTeam(data)
    .success(res => window.location.href = res.nextUrl)
    .error(err => displayErrorInFeedback(err.responseJSON.error))
    .always(() => toggleLoading('#mainCTA'));
}

function clickGenderButton(that) {
  let selection = $(that).val();

  if (selection === window.gender) {
    $('#' + selection).toggleClass('bo-reg-selected-button');
  } else {
    $('#' + selection).addClass('bo-reg-selected-button');
    $('#' + window.gender).removeClass('bo-reg-selected-button');
  }

  window.gender = selection;
}

$(document).ready(() => {

  $('#profilePic').change(function () {
    onProfilePicChange(this);
  });

  $('#forgotPW').click(clickForgotPassword);
  $('#resetPwForm').on('submit', clickResetPassword);

  // Why do we need to check the length here??
  if ($('#registerForm').length > 0) {
    $('#registerForm').on('submit', clickRegister);
  } else if ($('#registrationForm').length > 0) {
    doSomethingWithGender();
    $('#registrationForm').on('submit', clickRegistration);
  } else if ($('#teamForm').length > 0) {
    $('#teamForm').on('submit', clickCreateTeam);
  } else if ($('#inviteForm').length > 0) {
    $('#inviteForm').on('submit', clickInviteUser);
  } else if ($('#team-invite').length > 0) {
    $('.joinLinkTeam').click(function () {
      clickJoinTeam(this);
    });
  } else if ($('#sponsorForm').length > 0) {
    $('button[name=gender]').click(function () {
      clickGenderButton(this);
    });
    $('#sponsorForm').on('submit', clickBecomeSponsor);
  }
});