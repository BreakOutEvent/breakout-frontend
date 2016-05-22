'use strict';

$(document).ready(function () {

  var searchval = "";

  $('#search').on('input', function () {
    var currval = $(this).val();

    if (currval !== searchval && currval.length > 0) {
      $.post('/messages/search/' + currval)
        .success(function (data) {
          renderSearchResults(data);
        })
        .error(function(error) {
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
      if (r.teamname) {
        htmlArr.push('<a href="#" class="list-group-item bo-messages-search-row" data-id="' + r.id + '">' + r.firstname + ' ' + r.lastname + ' (' + r.teamname + ')</a>');
      } else {
        htmlArr.push('<a href="#" class="list-group-item bo-messages-search-row" data-id="' + r.id + '">' + r.firstname + ' ' + r.lastname + '</a>');
      }
    }

    $('#searchResults').html(htmlArr.join(''));

  }
});