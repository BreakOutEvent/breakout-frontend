'use strict';

var gender = null;

$('button[name=gender]').click(function () {
  let selection = $(this).val();

  if (selection === gender) {
    $('#' + selection).toggleClass('bo-reg-selected-button');
  } else {
    $('#' + selection).addClass('bo-reg-selected-button');
    $('#' + gender).removeClass('bo-reg-selected-button');
  }

  gender = selection;

});

function sanityCheck() {

  var inputs = $('input,select');



  inputs.each((i,element) => {
    let val = $(element).val();

    if($(element).prop('type') == 'checkbox' ) {
      val = $(element).is(':checked');
    }
    if(!val || val === '' || typeof val === 'undefined') {
      $(element).addClass('bo-reg-form-error');
    } else {
      $(element).removeClass('bo-reg-form-error');
    }
  });

  if(!gender) {
    $('button[name=gender]').addClass('bo-reg-form-error');
  } else {
    $('button[name=gender]').removeClass('bo-reg-form-error');
  }

  return !$('.bo-reg-form-error').length;
}

$('#registrationForm').on('submit', function (e) {
  e.preventDefault();


  if (sanityCheck()) {
    var values = {
      firstname: $('#firstname').val(),
      lastname: $('#lastname').val(),
      phonenumber: $('#phonenumber').val(),
      emergencynumber: $('#emergencynumber').val(),
      tshirtsize: $('#tshirtsize').val(),
      gender: gender
    };

    console.log("FORM");

    $.post('/participant', values)
      .success(function (data) {
        window.location.href = data.nextURL;
      })
      .error(function (err) {
        console.log(err);
      });
  }
});
