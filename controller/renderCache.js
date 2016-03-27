var fs = require('fs');
var path = require('path');
var Maybe = require('maybe');

var rc = {};

const FileType = new Enum(['Template', 'Rendered']);

function readFile(folder, file, fileType) {
  const pathBuilder = {
    [FileType.Template]: rc.buildTemplateFilePath,
    [FileType.Rendered]: rc.buildRenderedFilePath
  };

  var fullPath = pathBuilder[fileType](folder, file + '.handlebars');
  if (rc.exists(fullPath))
    return Maybe(fs.readFileSync(fullPath, 'utf8'));
  return Maybe();
}

/**
 * Checks if a file exists and can be read from and written to.
 * Calls the callback with an error instance, if anything went wrong.
 * @param file File to check
 * @returns boolean
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
    const fullPath = this.buildRenderedFilePath(folder, file);
    if (rc.exists(fullPath))
      fs.renameSync(fullPath, this.buildRenderedFilePath(folder, file + "_" + rc.getFileTimeStamp(folder, file)));
    fs.writeFileSync(fullPath, data);
  };

/**
 * Reads the file $folder/$file and returns its contents, if it doesn't exist the return value is Maybe.Nothing
 * @param folder
 * @param file
 * @returns Maybe(String)
 */
rc.readRenderedFile =
  (folder, file) => readFile(folder, file, FileType.Rendered);

/**
 * Reads a template file from /templates/$folder
 * @param folder
 * @param file
 */
rc.readTemplateFile =
  (folder, file) => readFile(folder, file, FileType.Template);


rc.readMasterTemplate =
  () =>
    rc.readTemplateFile('', 'master');

/**
 * Simply joins the rendered-path, folder and file together
 * @param folder
 * @param file
 * @returns {*}
 */
rc.buildRenderedFilePath =
  (folder, file) => path.join(__dirname, '../rendered', folder, file);

rc.buildTemplateFilePath =
  (folder, file) => path.join(__dirname, '../templates', folder, file);

module.exports = rc;