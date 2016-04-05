'use strict';
const mongoose = require('./mongo.js');
const handlebars = require('handlebars');
const fileSystem = require('./file-system');
const reader = require('./template-reader');
const _ = require('lodash');

//Define Models
const Page = mongoose.model('page', require('../schemas/page.js'));

//Define empty object
var renderer = {};

/**
 * Searches for the localized language string, and falls back to german if nothing is found.
 * @param view
 * @param language
 * @returns {*}
 */
function getVariables(view, language) {
  return view.variables.reduce((initial, curr) => {
    const lang = curr.values.find(e => e.language === language) ? language : 'de';
    initial[curr.name] = (curr.values.find(e => e.language === lang) || { value: 'Default' }).value;
    return initial;
  }, {});
}

renderer.renderPage = (pageID, cb) =>
  Page
    .findOne({ _id: pageID })
    .populate('views')
    .exec((err, page) => {
      if (err) throw err;
      else if (!page) throw new Error(`Page with id ${pageID} does not exist.`);

      // Iterate properties to render each language separately
      for (let elem of page.properties) {
        // Render each view on the page with the current language
        const html = page.views.reduce((initial, curr) => {

          // Read view template (partial)
          const hbt = fileSystem.readTemplateFile(curr.templateName);

          if (hbt.isNothing())
            throw new Error(`Partial ${curr.templateName} not existing`);

          // Compiles the template and returns the resulting html code
          return initial + handlebars.compile(hbt.value())(getVariables(curr, elem.language));
        }, '');

        // Gets all required scripts for the page together
        const requirements = _.uniq(page.views.reduce((initial, curr) => {
          const req = reader.getByName(curr.templateName) || { requirements: [] };
          return _.concat(initial, req.requirements);
        }, []));

        //Read page template
        const handlebarsTemplate = fileSystem.readMasterTemplate();
        if (handlebarsTemplate.isNothing()) throw new Error(`Master template not existing`);

        cb(
          handlebars.compile(handlebarsTemplate.value())(
            {
              content: html,
              requirements: requirements
            }),
          elem.language,
          elem.url + '.html'
        );
      }
    });

/**
 * Renders and saves the supplied page to /rendered in all available languages.
 * @param pageID
 */
renderer.renderAndSavePage = pageID =>
  renderer.renderPage(pageID, (html, language, filename) =>
    fileSystem.writeRenderedFile(language, filename, html)
  );

module.exports = renderer;
