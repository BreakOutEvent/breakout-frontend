'use strict';

var gender = null;

$('input[name=gender]').click(function() {
  gender = $(this).val();
  console.log(gender);
});

$('#registrationForm').on('submit', function(e) {
  e.preventDefault();

  var values = {
    firstname: $('#firstname').val(),
    lastname: $('#lastname').val(),
    phone: $('#phone').val(),
    emergencynumber: $('#emergency_phone').val(),
    tshirtsize: $('#size').val(),
    gender: gender
  };


  $.post('/participant', values)
    .success(function(data) {
      window.location.href = data.nextURL;
    })
    .error(function(err) {
      console.log(err);
    });
});
