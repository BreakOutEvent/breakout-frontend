'use strict';
var mongoose = require('./mongo.js');
var handlebars = require('handlebars');
var data = require('./dataProxy.js');

//Define Models
var Page = mongoose.model('page', require('../schemas/page.js'));
var View = mongoose.model('view', require('../schemas/view.js'));


//Define empty object
var renderer = {};


renderer.renderPage = function (pageID, cb) {

  var tempViewHTML = [];

  Page.findOne({'_id': pageID}, function (err, page) {
    if (err) {
      throw err;
    } else {

      //Render HTML for each View
      page.views.forEach(function (view) {
        renderer.renderView(view._id, function (html) {
          tempViewHTML.push({'_id': view._id, 'html': html});
        });
      });

      //Fill template with HTML from Views
      //For static pages we assume that we just concat the views
      var html = tempViewHTML.reduce(function (el) { return el.html; });

      //Read page template
      var handlebarsTemplate = data.readTemplateFile('page', pageID);

      //Compile template to function
      var compiledTemplate = handlebars.compile(handlebarsTemplate);

      //Callback with completed html
      cb(compiledTemplate({'body': html}));
    }
  });

  //1. Grab all views for this page
  //2. For each view, execute this.renderView
  //3. wait for the callback
  //4. Render the page by combining the view HTML files
  //5. Save the rendered page as HTML with timestamp

};

renderer.renderView = function (viewID, cb) {

  View.findOne({'_id': viewID}, function (err, view) {
    if (err) {
      throw err;
    } else {
      //Read page template
      var handlebarsTemplate = data.readTemplateFile('view', viewID);

      //Compile template to function
      var compiledTemplate = handlebars.compile(handlebarsTemplate);

      //Callback with completed html
      cb(compiledTemplate(view.values));
    }
  });

  //1. Grab the template for this view
  //2. Combine the template with the vars from the view
  //3. Render the view and save as atomic HTML file with timestamp

};

module.exports = renderer;
