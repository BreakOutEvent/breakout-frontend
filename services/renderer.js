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
const renderer = {};

/**
 * Returns all requirements uniquely from a page.
 * @param page Page doc from the database.
 * @returns {Array<String>}
 */
function getRequirements(page) {
  return _.uniq(
    page.views.reduce((initial, curr) => {
      const req = reader.getByName(curr.templateName) || { requirements: [] };
      return _.concat(initial, req.requirements);
    }, [])
  );
}

/**
 * Returns all views for a page in one specific language concatenated in one string.
 * @param page
 * @param language
 * @returns {Promise.<T>}
 */
function getViewsHTML(page, language) {
  /**
   * Searches for the localized language string, and falls back to german if nothing is found.
   * @param view
   * @param language
   * @returns {*}
   */
  function getVariables(view, language) {
    return view.variables.reduce((init, curr) => {
      const lang = curr.values.find(e => e.language === language) ? language : 'de';
      init[curr.name] = (curr.values.find(e => e.language === lang) || { value: 'Default' }).value;
      return init;
    }, {});
  }

  return co(function*() {
    const templates = [];
    for (let curr of page.views) {
      templates.push(
        yield HBS.render(fileSystem.buildTemplatePath(curr.templateName),
          getVariables(curr, language))
      );
    }

    // Simply add all rendered views together into on single string
    return templates.reduce((init, curr) => init + curr, '');
  }).catch(ex => {
    throw ex;
  });
}

renderer.renderPageByURL = (language, url) => co(function*() {
  const propertyObject = {
    language: language,
    url: url
  };

  logger.info('Trying to fetch page', propertyObject);

  const page = yield Page
    .findOne({
      properties: {
        // Only finds objects with exactly these attributes
        $elemMatch: propertyObject
      }
    })
    .populate('views')
    .exec();

  if (!page) throw new Error(`No page found by /${language}/${url}`);

  logger.info('Fetched page', propertyObject);

  const pageProp = (page.properties = _.filter(page.properties, p => p.language === language))[0];

  return yield HBS.render(fileSystem.buildMasterTemplatePath(),
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

/**
 * Renders one single page by pageID (Mongo ID) and returns an array of Objects of the form
 * {html, language, filename} per available language.
 * @param pageID
 * @returns {Array<{html,language,filename}>}
 */
renderer.renderPageByID = pageID => co(function*() {
  logger.info('Trying to fetch page', pageID);
  const page = yield Page
    .findOne({
      _id: pageID
    })
    .populate('views')
    .exec();

  if (!page) throw new Error('No page');

  logger.info('Fetched page', pageID);

  const requirements = getRequirements(page);

  var renderedPages = [];
  for (let currProp of page.properties) {
    renderedPages.push({
      html: yield HBS.render(fileSystem.buildMasterTemplatePath(),
        {
          content: yield getViewsHTML(page, currProp.language),
          requirements: requirements,
          title: currProp.title,
          language: currProp.language
        }
      ),
      language: currProp.language,
      filename: currProp.url
    });
  }

  return renderedPages;
}).catch(ex => {
  throw ex;
});

/**
 * Renders and saves the supplied page to /rendered in all available languages.
 * @param pageID
 */
renderer.renderAndSavePageByID = pageID => co(function*() {
  for (const page of yield renderer.renderPageByID(pageID)) {
    yield fileSystem.writeRenderedFile(page.language, page.filename, page.html);
  }
}).catch(ex => {
  throw ex;
});

renderer.renderAndSavePageByURL = (language, url) => co(function*() {
  const filePath = fileSystem.buildRenderedPath(language, url);
  return fs.writeFile(filePath, yield renderer.renderPageByURL(language, url));
}).catch(ex => {
  throw ex;
});

module.exports = renderer;
