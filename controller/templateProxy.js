'use strict';
var mongoose = require('./mongo.js');
var handlebars = require('handlebars');
var fs = require('fs');

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
        proxy.getPage(doc._id, function () {
          //Do we need to do sth?
        });
      })
    }
  });

  //1. Grab all pages from mongodb
  //2. execute this.renderPage for each page

};

proxy.getPage = function (pageID, cb) {

  var pages = checkForFiles('page', pageID);

  if(pages.length > 0) {
    //Found some pages with the correct IDs
    pages.sort();

    fs.readFile(__dirname + '/rendered/page/' + pages[0], function (err, data) {
      if (err) {
        throw err;
      }
      console.log(data);
    });


  } else {
    //Nothing found just render it
    proxy.renderPage(pageID, cb);

  }


  //1. Check if there is one or more HTML files for this page
  //1.1 If YES, send the most current version -- done
  //1.2 If NO, request render from proxy -- send HTML on callback

};

proxy.renderPage = function (pageID, cb) {

  var tempViewHTML = [];

  Page.findOne({'_id': pageID}, function (err, page) {
    if (err) {
      throw err;
    } else {

      //Render HTML for each View
      page.views.forEach(function (view) {
        proxy.getView(view._id, function (html) {
          tempViewHTML.push({'_id': view._id, 'html': html});
        });
      });

      //Fill template with HTML from Views
      //For static pages we assume that we just concat the views
      var html = tempViewHTML.map(function (el) {
        return el.html;
      }).join("");

      //Read page template
      var handlebarsTemplate = readHandlebarsTemplateSync('page', pageID);

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

proxy.getView = function (viewID, cb) {

  var views = checkForFiles('view', viewID);

  if(views.length > 0) {
    //Found some pages with the correct IDs
    views.sort();

    fs.readFile(__dirname + '/rendered/page/' + views[0], function (err, data) {
      if (err) {
        throw err;
      }
      console.log(data);
    });


  } else {
    //Nothing found just render it
    proxy.renderView(viewID, cb);

  }

};

proxy.renderView = function (viewID, cb) {

  View.findOne({'_id': viewID}, function (err, view) {
    if (err) {
      throw err;
    } else {
      //Read page template
      var handlebarsTemplate = readHandlebarsTemplateSync('view', viewID);

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


function readHandlebarsTemplateSync(folder, id) {

}

function checkForFiles(folder,id) {

  return fs.readdirSync(__dirname + '/rendered/' + folder).filter(function(filename) {
    return filename.match(new RegExp(id + '-' + '\d*.html')) !== null;
  }) || [];

}

module.exports = proxy;