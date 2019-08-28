'use strict';

const co = require('co');
const _ = require('lodash');


const api = require('../services/api-proxy');

let liveblog = {};

liveblog.getEventInfos = (activeEvents) => co(function *() {
  let eventsInfo = yield api.event.allActiveInfo(activeEvents);

  let events = yield eventsInfo.events.map(e => {
    e.distance = api.event.getDistance(e.id);
    e.donatesum = api.event.getDonateSum(e.id);
    return e;
  });

  return {
    activeEvents: eventsInfo.activeEvents,
    allSameBrand: eventsInfo.allSameBrand,
    allOfBrand: eventsInfo.allOfBrand,
    allCurrent: eventsInfo.allCurrent,
    allOfCurrent: eventsInfo.allOfCurrent,
    allByBrand: eventsInfo.allByBrand,
    eventString: eventsInfo.eventString,
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

liveblog.getHighscores = (eventId) =>{
  return api.general.get(`/event/${eventId}/highscore/`);
};

liveblog.getAllPostings = (activeEvents, token) => co(function *() {
  const page = 0;
  return yield api.posting.getPostingsForEvent(activeEvents, token, page);
}).catch(ex => {
  throw ex;
});

liveblog.getCounterInfos = (events) => co(function *() {

  if (events.every(e => e.date === events[0].date && e.isCurrent)) {
    return {
      start: events[0].date * 1000,
      end: events[0].date * 1000 + (events[0].duration * 60 * 60 * 1000),
      current: Date.now()
    };
  } else {
    return null;
  }

}).catch(ex => {
  throw ex;
});

liveblog.chooseEvent = (req, res, next) => co(function *() {
  if (!req.session.activeEvents) req.session.activeEvents = [];

  req.session.activeEvents = req.body.eventIds.map((id) => parseInt(id));
  req.session.save();
  res.send('selected event ' + req.session.activeEvents);

}).catch(ex => {
  throw ex;
});


liveblog.returnPostings = (req, res, next) => co(function *() {

  var token = req.isAuthenticated() ? req.user : null;
  var page = req.body.page ? req.body.page : null;
  var activeEvents = req.body.activeEvents ? req.body.activeEvents.map(e => parseInt(e)) : null;

  let postings = yield api.posting.getPostingsForEvent(activeEvents, token, page);

  return res.render('dynamic/liveblog/postings', {
    layout: false,
    postings: postings,
    language: req.language
  });


}).catch(ex => {
  throw ex;
});

liveblog.getMapData = (activeEvents) => co(function *() {

  let allEvents = yield api.event.all();
  let filteredEvents = allEvents.filter(e => _.includes(activeEvents, e.id));
  let locationsEvents = yield filteredEvents.map(e => {
    return api.location.getByEvent(e.id);
  });

  let locations = [];
  locationsEvents.forEach(e => {
    e.forEach(tl => {
      locations.push(tl);
    });
  });

  let teams = [];
  locations.forEach(tl => {
    teams[tl.id] = {
      id: tl.id,
      name: tl.name,
      event: allEvents.find(e => e.id === tl.event),
      locations: tl.locations
    };
  });

  return teams;

}).catch(ex => {
  throw ex;
});


module.exports = liveblog;
