'use strict';

const _ = require('lodash');
const co = require('co');

const liveblog = require('../controller/liveblog');
const api = require('../services/api-proxy');

var websocket = {};

websocket.init = (io) => {

  var CronJob = require('cron').CronJob;

  //Event Infos
  // new CronJob('*/10 * * * * *', () => co(function*() {
  //   var data = yield liveblog.getEventInfos();
  //   io.sockets.emit('newEventInfos', data);
  // }), null, true);


  //Postings

  // var oldData = [];
  // new CronJob('*/10 * * * * *', () => co(function*() {
  //   var data = yield api.posting.getAllPostings(null, 0, 10);
  //   var diff = [];
  //   if (oldData.length === 0) {
  //     FIRST EXECUTION
      // oldData = data;
    // } else {
    //   diff = compareData(oldData, data);
    //   oldData = data;
    // }
    // if(diff.length > 0) {
    //   var html = yield HBS.render('views/dynamic/liveblog/postings.handlebars',
    //     {
    //       layout: false,
    //       postings: diff
    //     }
    //   );
    //   io.sockets.emit('newPostings', {postings: html});
    // }
  //
  // }).catch(err => {
  //   TODO: Logging
  // }), null, true);
};

function compareData(oldData, data) {
  return data.filter(d => oldData[0].id < d.id);
}


module.exports = websocket;