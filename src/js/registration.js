'use strict';

function sanityCheck() {

  var inputs = $('input,select');

  inputs.each((i, element) => {
    let val = $(element).val();

    if ($(element).prop('type') === 'checkbox') {
      val = $(element).is(':checked');
    }
    if (!val || val.trim() === '') {
      $(element).addClass('bo-reg-form-error');
    } else {
      $(element).removeClass('bo-reg-form-error');
    }
  });

  if ($.contains(document.documentElement, $('#registrationForm')) && !window.gender) {
    $('button[name=gender]').addClass('bo-reg-form-error');
  } else {
    $('button[name=gender]').removeClass('bo-reg-form-error');
  }

  return !$('.bo-reg-form-error').length;
}

$(document).ready(() => {

  if ($('#registrationForm').length > 0) {
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

    $('#registrationForm').on('submit', function(e) {
      e.preventDefault();


      if (sanityCheck()) {
        var values = {
          firstname: $('#firstname').val(),
          lastname: $('#lastname').val(),
          phonenumber: $('#phonenumber').val(),
          emergencynumber: $('#emergencynumber').val(),
          tshirtsize: $('#tshirtsize').val(),
          gender: window.gender
        };

        $.post('/participant', values)
          .success(function(data) {
            window.location.href = data.nextURL;
          })
          .error(function(err) {
            console.log(err);
          });
      }
    });
  } else if ($('#teamForm').length > 0) {
    $('#teamForm').on('submit', function(e) {
      e.preventDefault();

      if (sanityCheck()) {
        var values = {
          teamname: $('#teamname').val(),
          email: $('#email').val(),
          event: $('#event').val()
        };

        $.post('/team-create', values)
          .success(function(data) {
            window.location.href = data.nextURL;
          })
          .error(function(err) {
            console.log(err);
          });
      }
    });
  }

});
