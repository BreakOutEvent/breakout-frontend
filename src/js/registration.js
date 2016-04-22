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
    console.log(val);
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


    $("#profilePic").change(function () {
      console.log(this.files[0]);
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          console.log(e);
          $('.bo-reg-uploadInputWrapper').css('background-image', 'url(' + e.target.result + ')');
          $('.registration-picture-icon').hide();
        };
        reader.readAsDataURL(this.files[0]);
      }
    });


    $('#registrationForm').on('submit', function (e) {
      e.preventDefault();


      if (sanityCheck()) {

        var data = new FormData($('#registrationForm')[0]);
        data.append('gender', window.gender);

        if(!$("#profilePic")[0].files || !$("#profilePic")[0].files[0]) {
          data.delete('profilePic');
        }

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
          });
      }
    });
  } else if ($('#teamForm').length > 0) {
    $('#teamForm').on('submit', function (e) {
      e.preventDefault();

      if (sanityCheck()) {
        var values = {
          teamname: $('#teamname').val(),
          email: $('#email').val(),
          event: $('#event').val()
        };

        $.post('/team-create', values)
          .success(function (data) {
            window.location.href = data.nextURL;
          })
          .error(function (err) {
            console.log(err);
          });
      }
    });
  }

});
