'use strict';
var mongoose = require('./mongo.js');
var handlebars = require('handlebars');
var data = require('./dataProxy.js');
var fs = require('fs');

//Define Models
var Page = mongoose.model('page', require('../schemas/page.js'));
var View = mongoose.model('view', require('../schemas/view.js'));


//Define empty object
var renderer = {};


renderer.renderPage = function (pageID) {
  Page
    .findOne({'_id': pageID})
    .populate("views")
    .exec(function (err, page) {
      if (err) {
        throw err;
      } else if (!page) {
        // how should we handle non-existing ids?
        throw null;
      } else {
        // Iterate properties for each language
        page.properties.forEach(function (elem) {

          var tempViewHTML = [];

          //Render HTML for each View
          page.views.forEach(function (view) {
            // render view with current page language
            renderer.renderView(view, elem.language, function (html) {
              tempViewHTML.push({'_id': view._id, 'html': html});
            });
          });

          //Fill template with HTML from Views (concat them)
          var html = tempViewHTML.reduce(function (iv, el) {
            return iv + el.html;
          }, "");

          //Read page template
          var handlebarsTemplate = data.readDerFuehrer();

          var pageHtml = handlebars.compile(handlebarsTemplate)({'content': html});

          fs.writeFile("rendered.html", pageHtml);

        });

      }
    });

  //1. Grab all views for this page
  //2. For each view, execute this.renderView
  //3. wait for the callback
  //4. Render the page by combining the view HTML files
  //5. Save the rendered page as HTML with timestamp

};

/**
 * Searches for the localized language string, and falls back to german if nothing is found.
 * @param view
 * @param language
 * @returns {*}
 */
renderer.getVariables = function (view, language) {
  return view.variables.reduce(function (iv, v) {
    iv[v.name] = (v.values.find(e => e.language === language) || v.values.find(e => e.language === 'de'))['value'];
    return iv;
  }, {});
};

renderer.renderView = function (view, language, cb) {
  //Read page template
  var handlebarsTemplate = data.readTemplateFile('partials', view.templateName);

  //Compile template to function
  var compiledTemplate = handlebars.compile(handlebarsTemplate);

  console.log(renderer.getVariables(view, language));

  //Callback with completed html
  cb(compiledTemplate());

  //1. Grab the template for this view
  //2. Combine the template with the vars from the view
  //3. Render the view and save as atomic HTML file with timestamp

};

module.exports = renderer;
