'use strict';

const co = require('co');
const _ = require('lodash');


const api = require('../../services/api-proxy');

let liveblog = {};

liveblog.getEventInfos = () => co(function *() {
  let allEvents = yield api.event.all();
  let events = yield allEvents.map(e => {
    e.distance = api.event.getDistance(e.id);
    e.donatesum = api.event.getDonateSum(e.id);
    return e;
  });

  return {
    individual: events,
    global: {
      donatesum: events.reduce((prev, curr) => {
        return prev + curr.donatesum.fullSum;
      }, 0),
      distance: events.reduce((prev, curr) => {
        return prev + curr.distance.distance;
      }, 0)
    }
  };

}).catch(ex => {
  throw ex;
});

liveblog.getAllPostings = (token) => co(function *() {
  return api.posting.getAllPostings(token, 0, 30);
}).catch(ex => {
  throw ex;
});

liveblog.getCounterInfos = (events) => co(function *() {

  if (events[0].date !== events[1].date) {
    throw 'Business logic missing!';
  }

  return {
    start: events[0].date * 1000,
    end: events[0].date * 1000 + (events[0].duration * 60 * 60 * 1000),
    current: Date.now()
  };

}).catch(ex => {
  throw ex;
});

liveblog.returnPostings = (req, res, next) => co(function *() {

  var token = req.isAuthenticated() ? req.user : null;
  var offset = req.body.offset ? req.body.offset : null;
  var limit = req.body.limit ? req.body.limit : null;

  let postings = yield api.posting.getAllPostings(token, offset, limit);

  return res.render('dynamic/liveblog/postings', {
    layout: false,
    postings: postings
  });


}).catch(ex => {
  throw ex;
});

liveblog.getMapData = () => co(function *() {

  let allEvents = yield api.event.all();
  let locationsEvents = yield allEvents.map(e => {
    return api.location.getByEvent(e.id);
  });

  let locations = [];
  locationsEvents.forEach(e => {
    e.forEach(tl => {
      locations.push(tl);
    })
  });

  let teams = [];
  locations.forEach(tl => {
    teams[tl.id] = {
      id: tl.id,
      name: tl.name,
      event: allEvents.find(e => {
        return e.id == tl.event;
      }),
      locations: tl.locations
    }
  });

  console.log(teams);

  return teams;

}).catch(ex => {
  throw ex;
});


module.exports = liveblog;