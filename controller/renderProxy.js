'use strict';
var mongoose = require('./mongo.js');
var handlebars = require('handlebars');
var data = require('./dataProxy.js');

//Define Models
var Page = mongoose.model('page', require('../schemas/page.js'));
var View = mongoose.model('view', require('../schemas/view.js'));


//Define empty object
var renderer = {};


renderer.renderPage = function (pageID) {
  Page.findOne({'_id': pageID}, function (err, page) {
    if (err) {
      throw err;
    } else {

      // Iterate properties for each language
      page.properties.forEach(function (elem){

        var tempViewHTML = [];

        //Render HTML for each View
        page.views.forEach(function (view) {
          // render view with current page language
          renderer.renderView(view._id, elem.language, function (html) {
            tempViewHTML.push({'_id': view._id, 'html': html});
          });
        });

        //Fill template with HTML from Views (concat them)
        var html = tempViewHTML.reduce(function (el) { return el.html; });

        //Read page template
        var handlebarsTemplate = data.readDerFuehrer();

        var pageHtml = handlebars.compile(handlebarsTemplate)({'content': html});

        // save to file

      });

    }
  });

  //1. Grab all views for this page
  //2. For each view, execute this.renderView
  //3. wait for the callback
  //4. Render the page by combining the view HTML files
  //5. Save the rendered page as HTML with timestamp

};

renderer.renderView = function (viewID, language, cb) {

  View.findOne({'_id': viewID}, function (err, view) {
    if (err) {
      throw err;
    } else {
      //Read page template
      var handlebarsTemplate = data.readTemplateFile('partials', view.templateName);

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
