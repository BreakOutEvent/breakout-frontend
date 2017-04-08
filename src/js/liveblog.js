'use strict';
const $ = require('jquery');

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
      $counter.html(leftPad(counter.time.days) + ':' + leftPad(counter.time.hours) + ':' + leftPad(counter.time.minutes) + ':' + leftPad(counter.time.seconds));
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
  (function ($) {
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
      speed: 1000,  // how long it should take to count between the target numbers
      refreshInterval: 100,  // how often the element should be updated
      decimals: 0,  // the number of decimal places to show
      onUpdate: null,  // callback method for every time the element is updated,
      onComplete: null  // callback method for when the element finishes updating
    };
  })($);


  $(window).on('load', function () {
    var socket = io('/');

    socket.on('newPostings', function (data) {
      var $postings = $(data.postings);
      var $teamPosts = $('#teamPosts');
      //console.log($postings);
      $teamPosts.prepend($postings);
      window.msnry.prepended($postings);
      //LOLOL DIRTY HACK FOR SLOW BROWSERS
      setTimeout(function () {
        window.msnry.layout();
      }, 200);
    });

    var donateCounting = false;
    var distanceCounting = false;

    socket.on('newEventInfos', function (data) {

      //console.log(data);

      var oldDonateSum = parseInt($('#bo-donate-sum').text().replace('.', ''));
      var newDonateSum = parseInt(data.global.donatesum.toFixed(0).toString().replace('.', ''));

      if (oldDonateSum < newDonateSum && !donateCounting) {
        donateCounting = true;
        $('#bo-donate-sum').countTo({
          from: oldDonateSum,
          to: newDonateSum,
          speed: 180000,
          refreshInterval: 100,
          onComplete: function () {
            donateCounting = false;
          }
        });

        $('.bo-donate-sum').each(function (i, e) {
          $(e).countTo({
            from: parseInt($(e).text().replace('.', '')),
            to: parseInt(data.individual[i].donatesum.fullSum.toFixed(0).toString().replace('.', '')),
            speed: 180000,
            refreshInterval: 100
          });
        });

      }

      var oldDistance = parseInt($('#bo-distance-sum').text().replace('.', ''));
      var newDistance = parseInt(data.global.distance.toFixed(0).toString().replace('.', ''));

      if (oldDistance < newDistance && !distanceCounting) {
        distanceCounting = true;
        $('#bo-distance-sum').countTo({
          from: oldDistance,
          to: newDistance,
          speed: 180000,
          refreshInterval: 100,
          onComplete: function () {
            distanceCounting = false;
          }
        });

        $('.bo-distance-sum').each(function (i, e) {
          $(e).countTo({
            from: parseInt($(e).text().replace('.', '')),
            to: parseInt(data.individual[i].distance.distance.toFixed(0).toString().replace('.', '')),
            speed: 180000,
            refreshInterval: 100
          });
        });
      }
    });
  });
});