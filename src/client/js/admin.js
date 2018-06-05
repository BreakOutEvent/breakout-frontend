'use strict';
const $ = require('jquery');
const _ = require('lodash');

var toggleLoading = require('./helpers').toggleLoading;

$(document).ready(() => {

  var $_GET = {};

  document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
    function decode(s) {
      return decodeURIComponent(s.split('+').join(' '));
    }
    $_GET[decode(arguments[1])] = decode(arguments[2]);
  });
  if($_GET['direction'] === 'up'){
    $('input.swap').attr('value', 'down');
  }
  else{
    $('input.swap').attr('value', 'up');
  }


  $('.moreinfo').hide();
  $('.member').css('cursor','pointer');
  $('.member').click(function(){
    $(this).siblings('.moreinfo').toggle();
  });

  $('.btn-payment').click(function () {

    toggleLoading(this, true);
    var button = this;
    var invoiceId = $(this).attr('data-invoice');
    var fidorId = parseInt($(`#fidor-id-${invoiceId}`).val());
    fidorId = isNaN(fidorId) ? null : fidorId;

    $.post('/admin/payment/add', {
      team: $(this).attr('data-team'),
      amount: $(this).attr('data-amount'),
      invoice: invoiceId,
      fidorId: fidorId
    }).success(function () {
      $('#results')
        .append('<div class="alert alert-success alert-dismissable">' +
          '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
          'Erfolgreich ' + $(button).attr('data-amount') + '€ zu Team ' +
          $(button).attr('data-team') + ' hinzugefügt </div>');
    }).error(function (err) {
      console.log(err);
      $('#results')
        .append('<div class="alert alert-danger alert-dismissable">' +
          '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
          'Eintragen von ' + $(button).attr('data-amount') + '€ zu Team ' +
          $(button).attr('data-team') + ' fehlgeschlagen: ' +
          err.responseJSON.message + ' </div>');
    }).always(() => {
      toggleLoading(this);
    });
  });


  $('.btn-sponsor-payment').submit(handleInvoicePaymentSubmit);

  function handleInvoicePaymentSubmit(e) {
    e.preventDefault();
    const amount = $(this).serializeArray()
      .filter(elem => elem.name === 'add-to-invoice-amount')[0].value;

    const fidorIdProvided = $(this).serializeArray()
      .filter(elem => elem.name === 'add-to-invoice-fidorid').length === 1;

    let fidorId = null;
    if(fidorIdProvided) {
      fidorId = $(this).serializeArray()
        .filter(elem => elem.name === 'add-to-invoice-fidorid')[0].value;
    }


    const invoiceId = parseInt($(this).attr('data-invoice'));

    addPaymentToInvoice(invoiceId, amount, fidorId,
      () => onAddPaymentToInvoiceSuccess(invoiceId, amount),
      onAddPaymentToInvoiceError);

  }

  function onAddPaymentToInvoiceSuccess(invoiceId, amount) {
    displaySuccess(`Added ${amount} to invoice ${invoiceId}`);
  }

  function onAddPaymentToInvoiceError(e) {
    displayError(`Error adding payment to invoice. Reason: ${e.responseText}`);
  }

  function addPaymentToInvoice(invoiceId, amount, fidorId, onSuccess, onError) {
    $.post('/admin/payment/add', {
      amount: amount,
      invoice: invoiceId,
      fidorId: fidorId
    }).success(onSuccess).error(onError);
  }

  function onCheckinSuccess(teamId) {
    const btn = $(`.btn-checkin[data-team="${teamId}"]`);
    btn.text('Successfully checked in');
    btn.addClass('btn-success');
  }

  function onCheckinError(error, teamId) {
    const message = _.get(error, 'responseJSON.message');
    const btn = $(`.btn-checkin[data-team="${teamId}"]`);
    btn.text(`Error checkin in team: ${message}`);
    btn.addClass('btn-danger');
  }

  $('.btn-checkin').click(function () {

    const teamId = $(this).attr('data-team');

    const payload = {
      team: teamId,
      event: $(this).attr('data-event')
    };

    $.post('/admin/team/checkin', payload)
      .success(() => onCheckinSuccess(teamId))
      .error((err) => onCheckinError(err, teamId));
  });

  $('.btn-addamount').click(function () {

    toggleLoading(this, true);
    var button = this;
    var invoiceId = $(this).attr('data-invoice');

    $.post('/admin/invoice/amount/add', {
      invoiceId: invoiceId,
      amount: $('#amount-' + invoiceId).val()
    }).success(function () {
      $('#results')
        .append('<div class="alert alert-success alert-dismissable">' +
          '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
          'Erfolgreich ' + $('#amount-' + invoiceId).val() + '€ zu Invoice ' +
          invoiceId + ' hinzugefügt </div>');
    }).error(function (err) {
      console.log(err);
      $('#results')
        .append('<div class="alert alert-danger alert-dismissable">' +
          '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
          'Eintragen von ' + $('#amount-' + invoiceId).val() + '€ zu Invoice ' +
          invoiceId + ' fehlgeschlagen: ' +
          err.responseJSON + ' </div>');
    }).always(() => {
      toggleLoading(this);
    });
  });

  $('[type=search]').on('input', function (e) {

    var val = $(this).val().toLowerCase();

    if (val.length < 1) {
      $('#list tr').show();
    } else {
      $('#list tr').each(function (i, e) {
        if ($(e).html().toLowerCase().indexOf(val) > -1) {
          $(e).show();
        } else {
          $(e).hide();
        }
      });
    }
  });

  const buttonAddNewPayment = $('#btn-addNewPayment');

  buttonAddNewPayment.click(() => {

    const data = {
      teamId: $('#teamId').val(),
      firstname: $('#firstname').val(),
      lastname: $('#lastname').val(),
      company: $('#company').val(),
      amount: $('#amount').val()
    };

    toggleLoading(buttonAddNewPayment);

    $.post('/admin/invoice/add', data)
      .success((response) => {
        const invoiceId = response.id;
        $.post('/admin/invoice/amount/add', {
          invoiceId: invoiceId,
          amount: data.amount
        }).success(() => {
          const message = `Rechnung mit ID ${invoiceId} erfolgreich erstellt und eine Zahlung von ${data.amount}€ hinzugefügt`;
          displaySuccess(message);
        }).error((err) => {
          const message = `Fehler beim hinzufügen einer Zahlung zur Rechnung mit ID ${invoiceId}: ${err.message}`;
          displayError(message);
        });
      })
      .error((err) => {
        displayError('Fehler beim Erstellen einer neuen Rechnung');
      })
      .always(() => toggleLoading(buttonAddNewPayment));
  });
});

function displaySuccess(message) {
  $('#results')
    .append('<div class="alert alert-success alert-dismissable">' +
      '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> ' + message + ' </div>');
}

function displayError(message) {
  $('#results')
    .append('<div class="alert alert-danger alert-dismissable">' +
      '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> ' + message + ' </div>');
}
