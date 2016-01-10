'use strict';
var mongoose = require('./mongo.js');
var fs = require('fs');
var renderer = require('./renderProxy.js');
var data = require('./dataProxy.js');


//Define empty object
var proxy = {};

/**
 * This function is supposed to be called once on initiating a new instance
 */

proxy.init = function () {

  //Define Models
  var Page = mongoose.model('page', require('../schemas/page.js'));

  Page.find({}, function (err, pages) {
    if (err) {
      console.log(err);
    } else {
      pages.forEach(function (page) {
        proxy.getPage(page._id, function () {
          //Do we need to do sth?
        });
      });
    }
  });

  //1. Grab all pages from mongodb
  //2. execute this.renderPage for each page

};

proxy.getPage = function (pageID, cb) {

  var pages = data.checkForRenderedFiles('page', pageID);

  if(pages.length > 0) {
    //Found some pages with the correct IDs
    pages.sort();

    cb(data.readRenderedFile('page',pages[0]));

  } else {
    //Nothing found just render it
    renderer.renderPage(pageID, cb);

  }

  //1. Check if there is one or more HTML files for this page
  //1.1 If YES, send the most current version -- done
  //1.2 If NO, request render from proxy -- send HTML on callback

};



proxy.getView = function (viewID, cb) {

  var views = data.checkForRenderedFiles('view', viewID);

  if(views.length > 0) {
    //Found some pages with the correct IDs
    views.sort();

    cb(data.readRenderedFile('view',views[0]));


  } else {
    //Nothing found just render it
    renderer.renderView(viewID, cb);

  }
};

proxy.checkForViewUpdates = function () {

  //IDEAS NOT FINAL FOR THIS ONE

  //FIRST PROBLEM
  //How do I know if something needs to be re-rendered?
  //Possible Solutions:
  //1. Having a message queue where any service can just list a view which will get re-rendered
  //2. Saving the rendered variables in a db and comparing them in certain intervals with the current values
  //3. Manually calling the re-render function when ever appropriate

  /*
   We probably need to distinguish between static pages (where we actually know about every change) and
   dynamic content which comes from the api. Solutions 1 - 3 are fine for static pages but for dynamic
   pages only solution 2 actually works. Solution 3 is out of questions and solution 1 can work but only if
   we mirror the message queue (if there is any) from the backend.
   */

};

module.exports = proxy;