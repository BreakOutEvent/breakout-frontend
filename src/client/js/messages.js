'use strict';
const $ = require('jquery');
$(document).ready(function () {

  var searchval = '';
  var selectedResults = [];

  $('#search').on('input', function () {
    var currval = $(this).val();

    if (currval !== searchval && currval.length > 0) {
      $.post('/messages/search/' + currval)
        .success(function (data) {
          renderSearchResults(data);
        })
        .error(function (error) {
          console.error(error);
          $('#error').html('<div class="alert alert-danger">' + error + '</div>');
        });

      searchval = currval;
    }


    console.log($(this).val());
  });

  function renderSearchResults(data) {

    var htmlArr = [];

    for (var i = 0; i < data.length; i++) {
      var r = data[i];

      var value = r.firstname + ' ' + r.lastname;
      if (r.teamname) {
        value = r.firstname + ' ' + r.lastname + ' (' + r.teamname + ')';
      }

      htmlArr.push('<a href="#" class="list-group-item bo-messages-search-row" data-id="' + r.id + '" data-value="' + value + '">' + value + '</a>');
    }

    $('#searchResults').html(htmlArr.join(''));


    $('.bo-messages-search-row').on('click', function () {
      searchResultSelector($(this));
    });
  }

  function searchResultSelector(item) {

    var results = $('#selectedResults');
    if (!results.html().toString().includes('data-id="' + item.attr('data-id') + '"')) {
      selectedResults.push('<a href="#" class="list-group-item bo-messages-selected-row" data-id="' + item.attr('data-id') + '">' + item.attr('data-value') + '</a>');
    }

    results.html(selectedResults.join(''));

    $('.bo-messages-selected-row').on('click', function () {
      deleteSelectedResult($(this));
    });
  }

  function deleteSelectedResult(item) {
    for (var i = 0; i < selectedResults.length; i++) {

      var value = selectedResults[i];
      if (item.attr('data-id') == $(value).attr('data-id')) {
        console.log(item.attr('data-id'), $(value).attr('data-id'));
        delete selectedResults[i];
      }
    }

    $('#selectedResults').html(selectedResults.join(''));

    $('.bo-messages-selected-row').on('click', function () {
      deleteSelectedResult($(this));
    });
  }

  $('#addGroupMessageModal').on('submit', function () {
    var userIds = selectedResults.map(item => parseInt($(item).attr('data-id')));
    console.log(userIds);

    $.ajax({
      url: '/messages/new',
      type: 'POST',
      data: JSON.stringify(userIds),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'
    }).success((data) => {
      window.location.href = '/messages/' + data.id;
    }).error(err => {
      $('#results').html('<div class="alert alert-danger">' + err.responseJSON.error + '</div>');
    });
  });

  $('#sendMessage').on('submit', function (e) {
    e.preventDefault();
    var text = $('#sendMessageText').val();
    var id = $('#messageId').val();
    $.ajax({
      url: '/messages/send/' + id,
      type: 'POST',
      data: JSON.stringify({ text: text }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'
    }).success((data) => {
      window.location.reload();
    }).error(err => {
      $('#results').html('<div class="alert alert-danger">' + err.responseJSON.error + '</div>');
    });

  });

  var panel = document.getElementById('bo-msg-panel');
  panel.scrollTop = panel.scrollHeight;
});