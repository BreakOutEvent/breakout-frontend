'use strict';
exports.sanityCheck = function(id) {

  var inputs = $(`#${id}`).find(':input');

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

    if( element.nodeName.toLowerCase() === 'select' ) {
      val = $(element).find('option:selected').val();
    }

    if (!val || val.trim() === '') {
      $(element).addClass('bo-reg-form-error');
    } else {
      $(element).removeClass('bo-reg-form-error');
    }
  });

  if ($('#registrationForm') && !window.gender) {
    $('button[name=gender]').addClass('bo-reg-form-error');
    alert('Bitte wählen Sie Ihre Anrede aus!');
  } else {
    $('button[name=gender]').removeClass('bo-reg-form-error');
  }

  return !$('.bo-reg-form-error').length;
};

exports.toggleLoading = function(button, small) {

  if(!small) {
    if ($(button).has('.spinner').length) {
      $(button).children('.spinner').remove();
      $(button).html($(button).children('span.hidden').html());
      $(button).removeAttr('disabled');
    } else {
      $(button).html('<span class="hidden">' + $(button).html() + '</span>');
      $(button).append('<div class="spinner"><div class="bounce1"></div>' +
        '<div class="bounce2"></div> <div class="bounce3"></div> </div>');
      $(button).prop('disabled',true);
    }
  } else {
    if ($(button).has('.spinner').length) {
      $(button).children('.spinner').remove();
      $(button).html($(button).children('span.hidden').html());
      $(button).removeAttr('disabled');
    } else {
      $(button).html('<span class="hidden">' + $(button).html() + '</span>');
      $(button).append('<div class="spinner spinner-small"><div class="bounce1"></div>' +
        '<div class="bounce2"></div> <div class="bounce3"></div> </div>');
      $(button).prop('disabled',true);
    }
  }

};