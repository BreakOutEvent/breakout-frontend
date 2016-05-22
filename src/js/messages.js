'use strict';

$(document).ready(function () {

  var searchval = "";
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
          $('#error').html('<div class="alert alert-danger">' +
            error + '</div>');
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
    console.log(item.attr('data-value'));

    selectedResults.push('<a href="#" class="list-group-item bo-messages-selected-row" data-id="' + item.attr('data-id') + '">' + item.attr('data-value') + '</a>');
    $('#selectedResults').html(selectedResults.join(''));

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
  
});