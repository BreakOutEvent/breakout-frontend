/**
 * Created by Ardobras on 04.05.2016.
 */
exports.sanityCheck = function(id) {

  var inputs = $(`#${id}`).find(`:input`);

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
};

exports.toggleLoading = function(button) {

  if ($(button).has('.spinner').length) {
    $(button).children('.spinner').remove();
    $(button).html($(button).children('span.hidden').html());
  } else {
    $(button).html('<span class="hidden">' + $(button).html() + '</span>');
    $(button).append('<div class="spinner"><div class="bounce1"></div>' +
      '<div class="bounce2"></div> <div class="bounce3"></div> </div>');
  }
};