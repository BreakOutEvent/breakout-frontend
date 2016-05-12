'use strict';

var sanityCheck = require('./helpers').sanityCheck;
var toggleLoading = require('./helpers').toggleLoading;

$(document).ready(() => {

  const addText = $('#amountPerKm_text');
  const addLimit = $('#limit');

  function output(text, limit, out, estimate) {
    return function () {
      let string = `Ein Team hat 2015 im Durchschnitt 800km zurück gelegt. Bei ${text.val()}€
      pro Kilometer ergäbe das eine Spendensummme von ${Math.round(800 * text.val())}€.`;
      if (limit.val() > 0 && limit.val() < Math.round(800 * text.val())) {
        string += ` Durch das Limit wird die Spendensumme
      auf maximal ${Math.round(limit.val())}€ beschränkt.`;
      }
      out.html(string);
      estimate.html(() => {
        if (limit.val() > 0 && limit.val() < Math.round(800 * text.val())) {
          return Math.round(limit.val());
        } else {
          return Math.round(800 * text.val());
        }
      });
    };
  }


  function setupListener(range, text, limit, updateOutput) {
    return function () {

      updateOutput();

      range.on('input', () => {
        text.val(range.val());
        updateOutput();
      });

      text.on('input', () => {
        range.val(text.val());
        updateOutput();
      });

      limit.on('input', () => {
        updateOutput();
      });
    };
  }

  var updateAddOutput = output(addText, addLimit, $('#output'), $('#estimate'));
  var addModal = setupListener($('#amountPerKm_range'), addText, addLimit, updateAddOutput);
  addModal();

  var editText = $('#bo-edit-amountPerKm-text');
  var editLimit = $('#bo-edit-limit');

  var updateEditOutput = output(editText, editLimit, $('#bo-edit-output'), $('#bo-edit-estimate'));
  var editModal = setupListener($('#bo-edit-amountPerKm-range'),
    editText, editLimit, updateEditOutput);
  editModal();

  var selfText = $('#bo-self-amountPerKm-text');
  var selfLimit = $('#bo-self-limit');

  var updateselfOutput = output(selfText, selfLimit, $('#bo-self-output'), $('#bo-self-estimate'));
  var selfModal = setupListener($('#bo-self-amountPerKm-range'),
    selfText, selfLimit, updateselfOutput);
  selfModal();

  $('.bo-btn-edit').on('click', function () {
    var data = $(this).parent().parent()
      .find('td').map(function () {
        return $(this).html();
      });

    $('#bo-edit-id').val(data[0]);
    $('#bo-edit-name').val(data[1]);
    $('#bo-edit-amountPerKm-range').val(data[2].replace('€', '').trim());
    $('#bo-edit-amountPerKm-text').val(data[2].replace('€', '').trim());
    $('#bo-edit-limit').val(data[3].replace('€', '').trim());

    updateEditOutput();
  });

  $('#selfSponsoringModal').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('selfSponsoringModal')) {
      var data = new FormData($('#selfSponsoringModal')[0]);

      if (!($('#bo-self-contract').length && $('#bo-self-contract')[0].files &&
        $('#bo-self-contract')[0].files[0])) {
        data.delete('contract');
      }

      toggleLoading('#bo-self-cta', true);
      $.ajax({
        url: '/settings/sponsoring/createOffline',
        type: 'POST',
        cache: false,
        processData: false,
        contentType: false,
        data: data
      })
        .success(function () {
          $('#result_profile')
            .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
        })
        .error(function (err) {
          console.log(err);
          $('#result_profile')
            .html('<div class="alert alert-error">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#bo-self-cta');
        });
    }

  });


});