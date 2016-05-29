'use strict';

$(document).ready(function () {
  var $counter = $('#boLBCounter');
  var $description = $('#boLbCounterDescription');

  function updateCounter() {

    var counter = {
      current: Date.now(),
      start: $counter.data('start'),
      end: $counter.data('end'),
      time: {}
    };

    if (counter.current < counter.start) {
      //Before event
      counter.state = 'bis zum Start des diesjährigen Events';
      counter.value = counter.start - counter.current;

    } else if (counter.current <= counter.end) {
      //During event
      counter.state = 'bis zum Ende des diesjährigen Events';
      counter.value = counter.end - counter.current;
    } else {
      //Post event
      counter.state = 'seit dem diesjährigen Event';
      counter.value = counter.current - counter.end;
    }


    counter.time.days = Math.floor(counter.value / (24 * 60 * 60 * 1000));
    counter.time.hours = Math.floor((counter.value - (counter.time.days * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    counter.time.minutes = Math.floor(
      (counter.value
      - (counter.time.days * 24 * 60 * 60 * 1000)
      - (counter.time.hours * 60 * 60 * 1000)) / (60 * 1000));
    counter.time.seconds = Math.floor(
      (counter.value
      - (counter.time.days * 24 * 60 * 60 * 1000)
      - (counter.time.hours * 60 * 60 * 1000)
      - (counter.time.minutes * 60 * 1000)) / 1000);

    if (counter.time.days > 1) {
      $counter.html(leftPad(counter.time.days) + ':' + leftPad(counter.time.hours) + ':' + leftPad(counter.time.minutes) + ':' + leftPad(counter.time.seconds));
    } else {
      $counter.html(leftPad(counter.time.hours + (counter.time.days * 24)) + ':' + leftPad(counter.time.minutes) + ':' + leftPad(counter.time.seconds));
    }

    $description.html(counter.state);

  }

  function leftPad(time) {
    let string = '00' + time;
    return string.substring(string.length - 2);
  }

  updateCounter();
  setInterval(updateCounter, 1000);

  //SCROLLING

  var $marker = $('#boTeamPostScroll');
  var loading = false;
  var finished = false;
  var current = $('.bo-team-card').length;
  $(window).scroll(function () {

    if ($marker.offset().top - 100 < window.scrollY + $(window).height()) {
      if (!loading && !finished) {
        loading = true;
        $.post('/liveblog/posting/', {
          limit: 30,
          offset: current
        })
          .success(function (postingsHTML) {
            var $postings = $(postingsHTML);
            if($postings.length === 0) {
              finished = true;
              $marker.html('<div class="alert alert-success">Keine weiteren Posts verfügbar!</div>')
            } else {
              current += $postings.length;
              $postings.each(function (i, e) {
                msnry.append(e);
              });
            }
          })
          .error(function () {
            $marker.html('<div class="alert alert-danger">Konnte keine weiteren Posts laden.</div>')
          })
          .always(function () {
            loading = false;
          })
      }
    }
  });


});