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
});