'use strict';

$(document).ready(() => {

  const range = $('#amountPerKm_range');
  const text = $('#amountPerKm_text');
  const limit = $('#limit');

  function updateOutput() {
    let output = `Ein Team hat 2015 im Durchschnitt 800km zurück gelegt. Bei ${text.val()}€
      pro Kilometer ergäbe das eine Spendensummme von ${Math.round(800 * text.val())}€.`;
    if (limit.val() > 0 && limit.val() < Math.round(800 * text.val())) {
      output += ` Durch das Limit wird die Spendensumme
      auf maximal ${Math.round(limit.val())}€ beschränkt.`;
    }
    $('#output').html(output);
    $('#estimate').html(() => {
      if(limit.val() > 0 && limit.val() < Math.round(800 * text.val())) {
        return Math.round(limit.val());
      } else {
        return Math.round(800 * text.val());
      }
    });
  }

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



});