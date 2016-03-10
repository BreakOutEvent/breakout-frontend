var fs = require('fs');
var path = require('path');
var Maybe = require('maybe');

var renderCache = {
  path: path.join(__dirname, '../rendered')
};

renderCache.exists = function (folder, file) {
  return fs.existsSync(path.join(renderCache.path, folder, file));
};

renderCache.getFileTimeStamp = function (folder, file) {
  // get stringified timestamp, using only numeric timestamp to stay alphanumeric
  return fs.statSync(path.join(renderCache.path, folder, file)).mtime.getTime();
};

renderCache.writeFile = function (folder, file, data) {
  var fullPath = path.join(renderCache.path, folder, file);
  if (renderCache.exists(folder, file)) {
    fs.renameSync(fullPath, path.join(renderCache.path, folder, file + "_" + renderCache.getFileTimeStamp(folder, file)));
  }
  fs.writeFileSync(fullPath, data);
};

renderCache.readFile = function (folder, file) {
  if (renderCache.exists(folder, file)) {
    return Maybe(fs.readFileSync(path.join(renderCache.path, folder, file)));
  }
  return Maybe.Nothing;
};

renderCache.buildFilePath = function (folder, file) {
  return path.join(renderCache.path, folder, file);
};

module.exports = renderCache;