var fs = require('fs');
var fsp = require('fs-promise');
var path = require('path');
var Maybe = require('maybe');

var renderCache = {
  path: path.join(__dirname, '../rendered')
};

/**
 * Checks if a file exists and can be read from and written to.
 * Calls the callback with an error instance, if anything went wrong.
 * @param folder Subfolder in /rendered
 * @param file File in subfolder
 * @returns boolean
 */
renderCache.exists = function (folder, file) {
  try {
    fs.accessSync(this.buildFilePath(folder, file), fs.R_OK | fs.W_OK);
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
renderCache.getFileTimeStamp = function (folder, file) {
  return fs.statSync(this.buildFilePath(folder, file)).mtime.getTime()
};

/**
 * Writes the contents in data into folder/file.
 * @param folder
 * @param file
 * @param data
 */
renderCache.writeFile = function (folder, file, data) {
  var fullPath = this.buildFilePath(folder, file);
  if (renderCache.exists(folder, file))
    fs.renameSync(fullPath, this.buildFilePath(folder, file + "_" + renderCache.getFileTimeStamp(folder, file)));
  fs.writeFileSync(fullPath, data);
};

/**
 * Reads the file folder/file and returns its contents, if it doesn't exist the return value is Maybe.Nothing
 * @param folder
 * @param file
 * @returns Maybe(String)
 */
renderCache.readFile = function (folder, file) {
  if (renderCache.exists(folder, file)) {
    return Maybe(fs.readFileSync(this.buildFilePath(folder, file)));
  }
  return Maybe.Nothing;
};

/**
 * Simply joins the rendered-path, folder and file together
 * @param folder
 * @param file
 * @returns {*}
 */
renderCache.buildFilePath = function (folder, file) {
  return path.join(this.path, folder, file);
};

module.exports = renderCache;