'use strict';

const co = require('co');
const _ = require('lodash');


const api = requireLocal('services/api-proxy');

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
          return prev + curr.donatesum.full_sum
        }
        , 0),
      distance: events.reduce((prev, curr) => {
          return prev + curr.distance.linear_distance
        }
        , 0)
    }
  };

}).catch(ex => {
  throw ex
});

liveblog.getAllPostings = (token) => co(function *() {
  return yield api.posting.getAllPostings(token,0,30);
}).catch(ex => {
  throw ex
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
  throw ex
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
  throw ex
});

liveblog.getMapData = () => co(function *() {

  let events = yield api.event.all();

  let eventsById = {};

  events.forEach(e => {
    eventsById[e.id] = e;
  });

  let allLocations = yield events.map(e => api.location.getByEvent(e.id));

  let locations = _.flatten(allLocations);
  locations = locations.filter(l => l.duringEvent);

  let teams = [];

  locations.forEach(l => {
    let t = teams[l.teamId];
    if(!t) {
      t = {
        id: l.teamId,
        name: l.team,
        event: eventsById[l.eventId],
        locations: []
      };
    }
    t.locations.push({
      latitude: l.latitude,
      longitude: l.longitude
    });

    teams[l.teamId] = t;
  });

  return teams;

}).catch(ex => {
  throw ex
});


module.exports = liveblog;