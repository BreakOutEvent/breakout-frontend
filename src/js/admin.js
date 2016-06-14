'use strict';
var toggleLoading = require('./helpers').toggleLoading;

$(document).ready(() => {
  $('.btn-payment').click(function () {

    toggleLoading(this, true);
    var button = this;

    $.post('/admin/payment/add', {
        team: $(this).attr('data-team'),
        amount: $(this).attr('data-amount'),
        invoice: $(this).attr('data-invoice')
      })
      .success(function () {
        $('#results')
          .append('<div class="alert alert-success alert-dismissable">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            'Erfolgreich ' + $(button).attr('data-amount') + '€ zu Team ' +
            $(button).attr('data-team') + ' hinzugefügt </div>');
      })
      .error(function (err) {
        console.log(err);
        $('#results')
          .append('<div class="alert alert-danger alert-dismissable">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            'Eintragen von ' + $(button).attr('data-amount') + '€ zu Team ' +
            $(button).attr('data-team') + ' fehlgeschlagen: ' + 
            err.responseJson.message + ' </div>');
      })
      .always(() => {
        toggleLoading(this);
      });
  });

  $('.btn-checkin').click(function () {

    toggleLoading(this, true);
    var button = this;

    $.post('/admin/team/checkin', {
      team: $(this).attr('data-team'),
      event: $(this).attr('data-event')
    })
      .success(function () {
        $('#results')
          .append('<div class="alert alert-success alert-dismissable">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            'Team ' + $(button).attr('data-team') + ' erfolgreich eingecheckt</div>');
      })
      .error(function (err) {
        console.log(err);
        $('#results')
          .append('<div class="alert alert-danger alert-dismissable">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            'Eintragen von Team ' + $(button).attr('data-team') + ' fehlgeschlagen: ' +
            err.responseJson.message + ' </div>');
      })
      .always(() => {
        toggleLoading(this);
      });
  });

  $('.btn-addamount').click(function () {

    toggleLoading(this, true);
    var button = this;
    var invoiceId = $(this).attr('data-invoice');

    $.post('/admin/invoice/payment/add', {
      invoiceId: invoiceId,
      amount: $('#amount-'+invoiceId).val()
    })
      .success(function () {
        $('#results')
          .append('<div class="alert alert-success alert-dismissable">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            'Erfolgreich ' + $('#amount-'+invoiceId).val() + '€ zu Invoice ' +
             invoiceId + ' hinzugefügt </div>');
      })
      .error(function (err) {
        console.log(err);
        $('#results')
          .append('<div class="alert alert-danger alert-dismissable">' +
            '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
            'Eintragen von ' + $('#amount-'+invoiceId).val() + '€ zu Invoice ' +
            invoiceId + ' fehlgeschlagen: ' +
            err.responseJson.message + ' </div>');
      })
      .always(() => {
        toggleLoading(this);
      });
  });

  $('[type=search]').on('input',function (e) {

    var val = $(this).val().toLowerCase();

    if (val.length < 1) {
      $("#list tr").show();
    } else {
      $("#list tr").each(function (i, e) {
        if($(e).html().toLowerCase().indexOf(val) > -1) {
          $(e).show();
        } else {
          $(e).hide();
        }
      });
    }
  })
});