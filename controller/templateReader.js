'use strict';

//3rd Party Dependencies
var fs = require('fs');


//Own Dependencies
var mongoose = require('./mongo.js');
var Template = mongoose.model('page', require('../schemas/template.js'));

//Globals
var config = {
  templatePath: __dirname + "/templates"
};
var readTemplates = {};



//Actual Code
readTemplates.init = function() {
  var filelist = readTemplates.readFromFolder(config.templatePath);
  filelist.forEach(function(file) {
    //Load File?
    var fileContent = fs.readFileSync(file.path); // ??? TODO Check actual output of readdirSync
    readTemplates.parseTemplate(fileContent);
  })
};

readTemplates.readFromFolder = function(path) {
  return fs.readdirSync(path) || [];
};

readTemplates.parseTemplate = function(fileContent) {

  //1. Find all handlebars elements by searching for {{*}}
  //2. Analyse to filter out helpers (start with #)
  //3. Read configuration header
  //4. return this as Template

};

readTemplates.saveToDB = function(template) {

  //Save Template to DB

};

module.exports = readTemplates;

