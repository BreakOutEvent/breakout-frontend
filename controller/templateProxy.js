'use strict';
var mongoose = require('./mongo.js');
var handlebars = require('handlebars');

//Define Models
var Page = mongoose.model('page', require('../schemas/page.js'));
var View = mongoose.model('view', require('../schemas/view.js'));
var Template = mongoose.model('template', require('../schemas/template.js'));

//Define empty object
var proxy = {};

/**
 * This function is supposed to be called once on initiating a new instance
 */

proxy.init = function () {

  Page.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      docs.forEach(function (doc) {
        proxy.renderPage(doc._id, function(){
          //Do we need to do sth?
        });
      })
    }
  });

  //1. Grab all pages from mongodb
  //2. execute this.renderPage for each page

};

proxy.getPage = function (pageID) {

  //1. Check if there is one or more HTML files for this page
  //1.1 If YES, send the most current version -- done
  //1.2 If NO, request render from proxy -- send HTML on callback

};

proxy.renderPage = function (pageID, cb) {

  console.log("rendering page with id", pageID);
  //1. Grab all views for this page
  //2. For each view, execute this.renderView
  //3. wait for the callback
  //4. Render the page by combining the view HTML files
  //5. Save the rendered page as HTML with timestamp

};

proxy.renderView = function (viewID, cb) {

  //1. Grab the template for this view
  //2. Combine the template with the vars from the view
  //3. Render the view and save as atomic HTML file with timestamp

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