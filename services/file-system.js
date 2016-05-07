'use strict';

/**
 * Handles reading, writing and renaming of all local files.
 */

const fs = require('co-fs-extra');
const path = require('path');
const co = require('co');

const rc = {};

/**
 * Returns the full absolute path to /rendered/${lang}/${filename}.html
 * @param lang
 * @param filename
 */
rc.buildRenderedPath = (lang, filename) =>
  path.join(ROOT, 'rendered', lang, filename + '.html');

/**
 * Builds the full absolute path to /views/templates/${filename}.handlebars
 * @param filename
 */
rc.buildTemplatePath = filename =>
  path.join(ROOT, 'views', 'templates', filename + '.handlebars');

/**
 * Builds the full absolute path to /views/layouts/master.handlebars.
 */
rc.buildMasterTemplatePath = () =>
  path.join(ROOT, 'views', 'layouts', 'master.handlebars');

/**
 * Reads the raw html content from /rendered/${lang}/${filename}.html
 * @param lang
 * @param filename
 */
rc.readRenderedFile = (lang, filename) => co(function*() {
  return yield fs.readFile(rc.buildRenderedPath(lang, filename), 'utf8');
}).catch(ex => {
  throw ex;
});

/**
 * Reads a template file from /templates/${folder}
 * @param filename
 */
rc.readTemplateFile = filename => co(function*() {
  return yield fs.readFile(rc.buildTemplatePath(filename), 'utf8');
}).catch(ex => {
  throw ex;
});

/**
 * Returns the raw contents of the master.handlebars template file in /views/layouts/.
 */
rc.readMasterTemplateFile = () => co(function*() {
  return yield fs.readFile(rc.buildMasterTemplatePath(), 'utf8');
}).catch(ex => {
  throw ex;
});

/**
 * Writes the contents in data into folder/file.
 * @param lang
 * @param filename
 * @param data
 */
rc.writeRenderedFile = (lang, filename, data) => co(function*() {
  const fullPath = rc.buildRenderedPath(lang, filename);
  if (yield fs.exists(fullPath))
    yield fs.rename(fullPath,
      fullPath + '_' + (yield rc.getFileTimeStamp(lang, filename))
    );
  yield fs.writeFile(fullPath, data);
}).catch(ex => {
  throw ex;
});

/**
 * Get stringified timestamp, using only numeric timestamp to stay alphanumeric
 * @param folder
 * @param file
 * @returns number
 */
rc.getFileTimeStamp = (folder, file) => co(function*() {
  return (yield fs.stat(rc.buildRenderedPath(folder, file))).mtime.getTime();
}).catch(ex => {
  throw ex;
});

module.exports = rc;
