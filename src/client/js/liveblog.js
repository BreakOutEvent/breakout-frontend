'use strict';
const $ = require('jquery');

$(document).ready(function () {

  var $counter = $('#boLBCounter');
  var $description = $('#boLbCounterDescription');


  function updateCounter() {
    const now = new Date();
    var counter = {
      current: now.setHours(now.getHours() + 2),
      start: $counter.data('start'),
      end: $counter.data('end'),
      time: {}
    };

    if (counter.current < counter.start) {
      //Before event
      counter.state = window.states.pre;
      counter.value = counter.start - counter.current;

    } else if (counter.current <= counter.end) {
      //During event
      counter.state = window.states.during;
      counter.value = counter.end - counter.current;
    } else {
      //Post event
      counter.state = window.states.post;
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
      $counter.html(leftPad(counter.time.days) + ' ' + window.days + ' ' + leftPad(counter.time.hours) + ':' + leftPad(counter.time.minutes) + ':' + leftPad(counter.time.seconds));
    } else {
      $counter.html(leftPad(counter.time.hours + (counter.time.days * 24)) + ':' + leftPad(counter.time.minutes) + ':' + leftPad(counter.time.seconds));
    }

    $description.html(counter.state);

  }

  function leftPad(time) {
    var string = '00' + time;
    return string.substring(string.length - 2);
  }


  updateCounter();
  setInterval(updateCounter, 1000);

  //SCROLLING

  var $marker = $('#boTeamPostScroll');
  var $teamPosts = $('#teamPosts');
  var loading = false;
  var finished = false;
  var current = 0;
  $(window).on('load', function () {
    $(window).scroll(function () {

      if ($marker.offset().top - 100 < window.scrollY + $(window).height()) {
        if (!loading && !finished) {
          loading = true;
          $.post('/liveblog/posting/', {
            activeEvents: window.activeEvents,
            page: current + 1
          }).success(function (postingsHTML) {
            var $postings = $(postingsHTML);
            if ($postings.length === 0) {
              finished = true;
              $marker.html('<div class="alert alert-success">Keine weiteren Posts verfügbar!</div>');
            } else {
              current++;
              $teamPosts.append($postings);
              window.msnry.appended($postings);
              //LOLOL DIRTY HACK FOR SLOW BROWSERS
              setTimeout(function () {
                window.msnry.layout();
              }, 200);
              setTimeout(function () {
                window.msnry.layout();
              }, 500);
              setTimeout(function () {
                window.msnry.layout();
              }, 2000);
              setTimeout(function () {
                window.msnry.layout();
              }, 5000);
              setTimeout(function () {
                window.msnry.layout();
              }, 15000);
              loading = false;
            }
          }).error(function () {
            $marker.html('<div class="alert alert-danger">Konnte keine weiteren Posts laden.</div>');
            loading = false;
          });
        }
      }
    });
  });

  $.fn.countTo = function (options) {
    // merge the default plugin settings with the custom options
    options = $.extend({}, $.fn.countTo.defaults, options || {});

    // how many times to update the value, and how much to increment the value on each update
    var loops = Math.ceil(options.speed / options.refreshInterval),
      increment = (options.to - options.from) / loops;

    return $(this).each(function () {
      var _this = this,
        loopCount = 0,
        value = options.from,
        interval = setInterval(updateTimer, options.refreshInterval);

      function updateTimer() {
        value += increment;
        loopCount++;
        $(_this).html(value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));

        if (typeof(options.onUpdate) == 'function') {
          options.onUpdate.call(_this, value);
        }

        if (loopCount >= loops) {
          clearInterval(interval);
          value = options.to;

          if (typeof(options.onComplete) == 'function') {
            options.onComplete.call(_this, value);
          }
        }
      }
    });
  };

  $.fn.countTo.defaults = {
    from: 0,  // the number the element should start at
    to: 100,  // the number the element should end at
    speed: 120000,  // how long it should take to count between the target numbers
    refreshInterval: 100,  // how often the element should be updated
    decimals: 0,  // the number of decimal places to show
    onUpdate: null,  // callback method for every time the element is updated,
    onComplete: null  // callback method for when the element finishes updating
  };


  function loadData() {
    var currentDonations = {};
    window.activeEvents.forEach(function(id) {
      $.get(
        'https://backend.break-out.org/event/' + id + '/donatesum/',
        function (data) {
          currentDonations[id] = data.fullSum;
          if(Object.keys(currentDonations).length === window.activeEvents.length) {
            count('bo-donate-sum', currentDonations);
          }
        }
      );
    });

    var currentDistance = {};
    window.activeEvents.forEach(function(id) {
      $.get(
        'https://backend.break-out.org/event/' + id + '/distance/',
        function (data) {
          currentDistance[id] = data.distance;
          if(Object.keys(currentDistance).length === window.activeEvents.length) {
            count('bo-distance-sum', currentDistance);
          }
        }
      );
    });
  }

  function count(target, currentData) {
    var old = window.oldData[target];

    var oldTotal = 0;
    var newTotal = 0;

    if(old) {
      window.activeEvents.forEach(function(id) {
        $(`.${target}[data-id='${id}']`).countTo({from: Math.round(old[id]), to: Math.round(currentData[id])});
        oldTotal += Math.round(old[id]);
        newTotal += Math.round(currentData[id]);
      });
      $('#' + target).countTo({from: oldTotal, to: newTotal});
    }

    window.oldData[target] = currentData;
  }

  window.oldData = {};
  setInterval(loadData, 30000);

});
