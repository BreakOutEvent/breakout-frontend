'use strict';
/**
 * Handles reading, writing and renaming of all local files.
 * @type {exports|module.exports}
 */

const fs = require('fs');
const path = require('path');
const Maybe = require('maybe');

var rc = {};

/**
 * Enum for available local files.
 */
const FileType = new Enum(['Template', 'Rendered']);

/**
 * Reads the file contents if it exists.
 * @param folder Folder from /
 * @param file File from /$folder/
 * @param fileType Available local files (-> FileType Enum)
 * @returns {Maybe} File content or Maybe.Nothing
 */
function readFile(folder, file, fileType) {
  // Register all available File Path builder
  const pathBuilder = {
    [FileType.Template]: rc.buildTemplateFilePath,
    [FileType.Rendered]: rc.buildRenderedFilePath,
  };

  // Build full path to every file
  const fullPath = pathBuilder[fileType](folder, file);
  if (rc.exists(fullPath))
    return Maybe(fs.readFileSync(fullPath, 'utf8'));
  return Maybe();
}

/**
 * Checks if a file exists and can be read from and written to.
 * Calls the callback with an error instance, if anything went wrong.
 * @param file File to check
 * @returns boolean True if file exists, false if it doesn't (or we can't access it)
 */
rc.exists =
  file => {
    try {
      fs.accessSync(file, fs.R_OK | fs.W_OK);
      return true;
    }
    catch (err) {
      return false;
    }
  };

/**
 * Get stringified timestamp, using only numeric timestamp to stay alphanumeric
 * @param folder
 * @param file
 * @returns number
 */
rc.getFileTimeStamp =
  (folder, file) => fs.statSync(this.buildRenderedFilePath(folder, file)).mtime.getTime();

/**
 * Writes the contents in data into folder/file.
 * @param folder
 * @param file
 * @param data
 */
rc.writeRenderedFile =
  (folder, file, data) => {
    const fullPath = rc.buildRenderedFilePath(folder, file);
    if (rc.exists(fullPath))
      fs.renameSync(fullPath,
        rc.buildRenderedFilePath(folder, file + '_' + rc.getFileTimeStamp(folder, file))
      );
    fs.writeFileSync(fullPath, data);
  };

/**
 * Reads the file $folder/$file and returns its contents,
 * if it doesn't exist the return value is Maybe.Nothing
 * @param folder
 * @param file
 * @returns Maybe(String)
 */
rc.readRenderedFile =
  (folder, file) => readFile(folder, file, FileType.Rendered);

/**
 * Reads a template file from /templates/$folder
 * @param file
 */
rc.readTemplateFile =
  file => readFile('partials', file, FileType.Template);

/**
 * Reads the master template file, e.g. the main layout.
 */
rc.readMasterTemplate =
  () => readFile('', 'master', FileType.Template);

/**
 * Simply joins the rendered-path, folder and file together
 * @param folder
 * @param file
 * @returns String
 */
rc.buildRenderedFilePath =
  (folder, file) => path.join(__dirname, '../rendered', folder, file);

/**
 * Look at buildRenderedFilePath.
 * @param folder
 * @param file
 * @returns String
 */
rc.buildTemplateFilePath =
  (folder, file) => path.join(__dirname, '../templates', folder, file + '.handlebars');

module.exports = rc;
