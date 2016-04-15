'use strict';
const mongoose = requireLocal('controller/mongo.js');
const fileSystem = requireLocal('services/file-system');
const reader = requireLocal('services/template-reader');
const _ = require('lodash');
const fs = require('fs');
const co = require('co');

//Define Models
const Page = mongoose.model('page', requireLocal('schemas/page.js'));

//Define empty object
let renderer = {};

function getRequirements(page) {
  return _.uniq(
    page.views.reduce((initial, curr) => {
      const req = reader.getByName(curr.templateName) || { requirements: [] };
      return _.concat(initial, req.requirements);
    }, [])
  );
}

function getViewsHTML(page, language) {
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

  return co(function*() {
    const templates = [];
    for (let curr of page.views) {
      templates.push(
        yield HBS.render(fileSystem.buildTemplateFilePath('templates', curr.templateName),
          getVariables(curr, language))
      );
    }

    // Render each view on the page with the current language
    return templates.reduce((initial, curr) => initial + curr, '');
  }).catch(ex => {
    console.error(ex);
  });
}

renderer.renderPageByURL = (language, url) => co(function*() {
  const page = yield Page
    .findOne({
      properties: {
        $elemMatch: {
          language: language,
          url: url
        }
      }
    })
    .populate('views')
    .exec();

  if (!page) throw new Error('No page');

  const pageProp = (page.properties = _.filter(page.properties, p => p.language === language))[0];

  return yield HBS.render(fileSystem.buildTemplateFilePath('layouts', 'master'),
    {
      content: yield getViewsHTML(page, language),
      requirements: getRequirements(page),
      title: pageProp.title,
      language: pageProp.language
    }
  );

}).catch(ex => {
  throw ex;
});

renderer.renderPageByID = pageID => co(function*() {
  const page = yield Page
    .findOne({
      _id: pageID
    })
    .populate('views')
    .exec();

  if (!page) throw new Error('No page');

  const requirements = getRequirements(page);

  var retVals = [];
  for (let currProp of page.properties) {
    retVals.push({
      html: yield HBS.render(fileSystem.buildTemplateFilePath('layouts', 'master'),
        {
          content: yield getViewsHTML(page, currProp.language),
          requirements: requirements,
          title: currProp.title,
          language: currProp.language
        }
      ),
      language: currProp.language,
      fileName: currProp.url + '.html'
    });
  }

}).catch(ex => {
  throw ex;
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
