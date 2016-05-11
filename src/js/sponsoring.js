'use strict';

$(document).ready(() => {

  const add_text = $('#amountPerKm_text');
  const add_limit = $('#limit');

  function output (text, limit, output, estimate) {
    return function () {
      let string = `Ein Team hat 2015 im Durchschnitt 800km zurück gelegt. Bei ${text.val()}€
      pro Kilometer ergäbe das eine Spendensummme von ${Math.round(800 * text.val())}€.`;
      if (limit.val() > 0 && limit.val() < Math.round(800 * text.val())) {
        string += ` Durch das Limit wird die Spendensumme
      auf maximal ${Math.round(limit.val())}€ beschränkt.`;
      }
      output.html(string);
      estimate.html(() => {
        if (limit.val() > 0 && limit.val() < Math.round(800 * text.val())) {
          return Math.round(limit.val());
        } else {
          return Math.round(800 * text.val());
        }
      });
    }
  }


  function setupListener (range, text, limit, updateOutput) {
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
    }
  }

  var updateAddOutput = output(add_text, add_limit, $('#output'), $('#estimate'));
  var addModal = setupListener($('#amountPerKm_range'), add_text, add_limit, updateAddOutput);
  addModal();

  var edit_text = $('#bo-edit-amountPerKm-text');
  var edit_limit = $('#bo-edit-limit');

  var updateEditOutput = output(edit_text, edit_limit, $('#bo-edit-output'), $('#bo-edit-estimate'));
  var editModal = setupListener($('#bo-edit-amountPerKm-range'), edit_text, edit_limit, updateEditOutput);
  editModal();

  $('.bo-btn-edit').on("click", function (e) {
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


});