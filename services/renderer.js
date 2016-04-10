'use strict';
const mongoose = requireLocal('controller/mongo.js');
const handlebars = require('handlebars');
const fileSystem = requireLocal('services/file-system');
const reader = requireLocal('services/template-reader');
const _ = require('lodash');
const fs = require('fs');
const co = require('co');

//Define Models
const Page = mongoose.model('page', requireLocal('schemas/page.js'));

//Define empty object
let renderer = {};

fs.readFile(ROOT + '/views/partials/footer_de.handlebars',
  'utf8',
  (err, data) => handlebars.registerPartial('footer_de', data));

fs.readFile(ROOT + '/views/partials/footer_en.handlebars',
  'utf8',
  (err, data) => handlebars.registerPartial('footer_en', data));

handlebars.registerHelper('concat', (first, second) => first + second);

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
      for (let currProp of page.properties) {
        co(function* () {

          const templates = [];
          for (let curr of page.views) {
            templates.push(
              yield HBS.render(fileSystem.buildTemplateFilePath('templates', curr.templateName),
                getVariables(curr, currProp.language))
            );
          }

          // Render each view on the page with the current language
          const html = templates.reduce((initial, curr) => initial + curr, '');

          // Gets all required scripts for the page together
          const requirements = _.uniq(
            page.views.reduce((initial, curr) => {
              const req = reader.getByName(curr.templateName) || { requirements: [] };
              return _.concat(initial, req.requirements);
            }, [])
          );

          cb(
            yield HBS.render(fileSystem.buildTemplateFilePath('layouts', 'master'),
              {
                content: html,
                requirements: requirements,
                title: currProp.title,
                language: currProp.language
              }
            ),
            currProp.language,
            currProp.url + '.html'
          );
        }).catch(ex => console.error(ex.stack));
        ;
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
