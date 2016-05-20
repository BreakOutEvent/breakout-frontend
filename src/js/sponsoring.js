'use strict';

var sanityCheck = require('./helpers').sanityCheck;
var toggleLoading = require('./helpers').toggleLoading;

$(document).ready(() => {

  function output(text, limit, output, estimate) {
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
    }
  }

  const add_text = $('#amountPerKm_text');
  const add_limit = $('#limit');

  var updateAddOutput = output(add_text, add_limit, $('#output'), $('#estimate'));
  var addModal = setupListener($('#amountPerKm_range'), add_text, add_limit, updateAddOutput);
  addModal();

  var edit_text = $('#bo-edit-amountPerKm-text');
  var edit_limit = $('#bo-edit-limit');

  var updateEditOutput = output(edit_text, edit_limit, $('#bo-edit-output'), $('#bo-edit-estimate'));
  var editModal = setupListener($('#bo-edit-amountPerKm-range'), edit_text, edit_limit, updateEditOutput);
  editModal();

  var self_text = $('#bo-self-amountPerKm-text');
  var self_limit = $('#bo-self-limit');

  var updateSelfOutput = output(self_text, self_limit, $('#bo-self-output'), $('#bo-self-estimate'));
  var selfModal = setupListener($('#bo-self-amountPerKm-range'), self_text, self_limit, updateSelfOutput);
  selfModal();

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

  $('#selfSponsoringModal').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('selfSponsoringModal')) {
      var data = new FormData($('#selfSponsoringModal')[0]);

      toggleLoading('#bo-self-cta', true);
      $.ajax({
          url: '/settings/sponsoring/create',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
        .success(function () {
          $('#result_in')
            .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
          $('#selfSponsoring').modal('hide');
          $('#selfSponsoringModal')[0].reset();
          updateSelfOutput();
        })
        .error(function (err) {
          console.log(err);
          $('#selfResult')
            .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#bo-self-cta');
        });
    }

  });

  $('#editSponsoringModal').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('editSponsoringModal')) {
      var data = new FormData($('#editSponsoringModal')[0]);

      toggleLoading('#bo-edit-cta', true);
      $.ajax({
          url: '/settings/sponsoring/edit',
          type: 'PUT',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
        .success(function () {
          $('#result_out')
            .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
          $('#editSponsoring').modal('hide');
          $('#editSponsoringModal')[0].reset();
          updateEditOutput();
        })
        .error(function (err) {
          console.log(err);
          $('#editResult')
            .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#bo-edit-cta');
        });
    }

  });

  $('#addSponsoringModal').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('addSponsoringModal')) {
      var data = new FormData($('#addSponsoringModal')[0]);

      toggleLoading('#bo-add-cta', true);
      $.ajax({
          url: '/settings/sponsoring/create',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
        .success(function () {
          $('#result_out')
            .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
          $('#addSponsoring').modal('hide');
          $('#addSponsoringModal')[0].reset();
          updateAddOutput();
        })
        .error(function (err) {
          console.log(err);
          $('#addResult')
            .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#bo-add-cta');
        });
    }
  });

  $('.bo-btn-accept').click(function (e) {
    var button = this;
    toggleLoading(button, true);
    $.post('/settings/sponsoring/accept', {
        teamId: $(button).attr('data-team'),
        eventId: $(button).attr('data-event'),
        sponsoringId: $(button).attr('data-sponsoring')
      })
      .success(function () {
        $('#result_in')
          .html('<div class="alert alert-success">Erfolgreich angenommen!</div>');
      })
      .error(function (err) {
        console.log(err);
        $('#result_in')
          .html('<div class="alert alert-danger">Annehmen fehlgeschlagen!</div>');
      })
      .always(() => {
        toggleLoading(button);
      });
  });

  $('.bo-btn-decline').click(function (e) {
    var button = this;
    toggleLoading(button, true);
    $.post('/settings/sponsoring/reject', {
        teamId: $(button).attr('data-team'),
        eventId: $(button).attr('data-event'),
        sponsoringId: $(button).attr('data-sponsoring')
      })
      .success(function () {
        $('#result_in')
          .html('<div class="alert alert-success">Erfolgreich abgelehnt!</div>');
      })
      .error(function (err) {
        console.log(err);
        $('#result_in')
          .html('<div class="alert alert-danger">Ablehnen fehlgeschlagen!</div>');
      })
      .always(() => {
        toggleLoading(button);
      });
  });

  $('.bo-btn-delete').click(function (e) {
    var button = this;
    toggleLoading(button, true);
    $.post('/settings/sponsoring/delete', {
        teamId: $(button).attr('data-team'),
        eventId: $(button).attr('data-event'),
        sponsoringId: $(button).attr('data-sponsoring')
      })
      .success(function () {
        $('#result_in')
          .html('<div class="alert alert-success">Erfolgreich gelöscht!</div>');
      })
      .error(function (err) {
        console.log(err);
        $('#result_in')
          .html('<div class="alert alert-danger">Löschen fehlgeschlagen!</div>');
      })
      .always(() => {
        toggleLoading(button);
      });
  });

  $('#addChallengeExtend').click(function(e) {
    var curr = $('#addChallengeRow');
    $(`<div class='row' id='addChallengeRow'>${curr.html()}</div>`).insertAfter(curr);
    curr.attr('id','');
  });

  $('#selfChallengeExtend').click(function(e) {
    var curr = $('#selfChallengeRow');
    $(`<div class='row' id='selfChallengeRow'>${curr.html()}</div>`).insertAfter(curr);
    curr.attr('id','');
  });

  $('#addChallengeForm').submit(function (e) {
    e.preventDefault();
    if (sanityCheck('addSponsoringModal')) {
      var data = new FormData($('#addChallengeForm')[0]);

      toggleLoading('#addChallengeCTA', true);
      $.ajax({
          url: '/settings/challenge/create',
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          data: data
        })
        .success(function () {
          $('#result_out')
            .html('<div class="alert alert-success">Erfolgreich gespeichert!</div>');
          $('#addChallenge').modal('hide');
          $('#addChallengeCTA')[0].reset();
        })
        .error(function (err) {
          console.log(err);
          $('#addChallengeResult')
            .html('<div class="alert alert-danger">Speichern fehlgeschlagen!</div>');
        })
        .always(() => {
          toggleLoading('#addChallengeCTA');
        });
    }
  });

  $('.challengeAccept').click(function (e) {
    var button = this;
    toggleLoading(button, true);
    $.post('/settings/sponsoring/accept', {
      teamId: $(button).attr('data-team'),
      eventId: $(button).attr('data-event'),
      sponsoringId: $(button).attr('data-sponsoring')
    })
      .success(function () {
        $('#result_in')
          .html('<div class="alert alert-success">Erfolgreich angenommen!</div>');
      })
      .error(function (err) {
        console.log(err);
        $('#result_in')
          .html('<div class="alert alert-danger">Annehmen fehlgeschlagen!</div>');
      })
      .always(() => {
        toggleLoading(button);
      });
  });

  $('.challengeReject').click(function (e) {
    var button = this;
    toggleLoading(button, true);
    $.post('/settings/sponsoring/reject', {
      teamId: $(button).attr('data-team'),
      eventId: $(button).attr('data-event'),
      sponsoringId: $(button).attr('data-sponsoring')
    })
      .success(function () {
        $('#result_in')
          .html('<div class="alert alert-success">Erfolgreich abgelehnt!</div>');
      })
      .error(function (err) {
        console.log(err);
        $('#result_in')
          .html('<div class="alert alert-danger">Ablehnen fehlgeschlagen!</div>');
      })
      .always(() => {
        toggleLoading(button);
      });
  });

});