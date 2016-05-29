'use strict';

const co = require('co');


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
        return prev + curr.donatesum.full_sum}
        , 0),
      distance: events.reduce((prev, curr) => {
          return prev + curr.distance.linear_distance}
        , 0)
    }
  };

}).catch(ex =>  {
  throw ex
});

liveblog.getAllPostings = () => co(function *() {

  return yield api.posting.getAllPostings();

}).catch(ex =>  {
  throw ex
});

liveblog.getCounterInfos = (events) => co(function *() {

  if(events[0].date !== events[1].date) {
    throw 'Business logic missing!';
  }

  return {
    start: events[0].date * 1000,
    end: events[0].date * 1000 + (events[0].duration * 60 * 60 * 1000),
    current: Date.now()
  };

}).catch(ex =>  {
  throw ex
});



module.exports = liveblog;