'use strict';

const co = require('co');
const _ = require('lodash');


const api = require('../../services/api-proxy');

let liveblog = {};

const getEventInfos = (activeEvents) => co(function *() {
  let eventsInfo = yield api.event.allActiveInfo(activeEvents);

  let events = yield eventsInfo.events.map(e => {
    e.distance = api.event.getDistance(e.id);
    e.donatesum = api.event.getDonateSum(e.id);
    return e;
  });

  return {
    activeEvents: eventsInfo.activeEvents,
    allSameYear: eventsInfo.allSameYear,
    allOfYear: eventsInfo.allOfYear,
    allCurrent: eventsInfo.allCurrent,
    allOfCurrent: eventsInfo.allOfCurrent,
    allByYear: eventsInfo.allByYear,
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
});

function getHighscores(eventId) {
  return api.general.get(`/event/${eventId}/highscore/`);
}

function getAllPostings(activeEvents, token) {
  const page = 0;
  return api.posting.getPostingsForEvent(activeEvents, token, page);
}

function getCounterInfos(events) {
  if (events.every(e => e.date === events[0].date && e.isCurrent)) {
    return Promise.resolve({
      start: events[0].date * 1000,
      end: events[0].date * 1000 + (events[0].duration * 60 * 60 * 1000),
      current: Date.now()
    });
  } else {
    return Promise.resolve(null);
  }
}

async function chooseEvent(req, res) {
  if (!req.session.activeEvents) req.session.activeEvents = [];

  let eventId = parseInt(req.body.eventId);
  let activate = req.body.activate === 'true';

  if (activate) {
    if (!_.includes(req.session.activeEvents, eventId)) {
      req.session.activeEvents.push(eventId);
      req.session.save();
      res.send('activated event ' + eventId);
    }
  } else {
    req.session.activeEvents = req.session.activeEvents.filter(id => id !== eventId);
    if (req.session.activeEvents.length === 0) {
      let events = await liveblog.getEventInfos(req.session.activeEvents);
      req.session.activeEvents = events.activeEvents;
    }
    req.session.save();
    res.send('deactivated event ' + eventId);
  }
  res.status(400).send('not working ' + eventId);
};


async function returnPostings(req, res, next) {

  const token = req.isAuthenticated() ? req.user : null;
  const page = req.body.page ? req.body.page : null;
  const activeEvents = req.body.activeEvents ? req.body.activeEvents.map(e => parseInt(e)) : null;

  const postings = await api.posting.getPostingsForEvent(activeEvents, token, page);

  return res.render('dynamic/liveblog/postings', {
    layout: false,
    postings: postings,
    language: req.language
  });
}


async function getMapData(activeEvents) {

  let allEvents = await api.event.all();
  let filteredEvents = allEvents.filter(e => _.includes(activeEvents, e.id));
  let locationsEvents = await Promise.all(filteredEvents.map(e => {
    return api.location.getByEvent(e.id);
  }));

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
}

module.exports = {
  getMapData,
  returnPostings,
  chooseEvent,
  getCounterInfos,
  getAllPostings,
  getHighscores,
  getEventInfos
};