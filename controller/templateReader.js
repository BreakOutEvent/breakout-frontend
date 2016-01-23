'use strict';

//3rd Party Dependencies
var fs = require('fs');
var path = require('path');
var parse5 = require('parse5');


//Own Dependencies
var mongoose = require('./mongo.js');
var Template = mongoose.model('page', require('../schemas/template.js'));

//Globals
var config = {
  templatePath: path.normalize(__dirname + "/../templates/")
};
var readTemplates = {};



//Actual Code
readTemplates.init = function() {
  console.log(config.templatePath);
  var filelist = readTemplates.readFromFolder(config.templatePath);
  console.log(filelist);
  filelist.forEach(function(file) {
    //Load File?
    var fileContent = fs.readFileSync(config.templatePath + file, { encoding: 'utf8' }); // ??? TODO Check actual output of readdirSync
    readTemplates.parseTemplate(fileContent);
  });
};

readTemplates.readFromFolder = function(path) {
  return fs.readdirSync(path) || [];
};

readTemplates.parseTemplate = function(fileContent) {

  var htmlObj = parse5.parse(fileContent).childNodes[0].childNodes[1].childNodes[0]; //html --> body --> goal element
  var variables = [];

  parseNodeRecursive(htmlObj, variables);

  function parseNodeRecursive(htmlNode, variables ) {

    console.log(htmlNode.nodeName);

    if(htmlNode.nodeName === '#text') {
      //Found a single end node
      var attrs = analyseAttrs(htmlNode.parentNode.attrs);
      var variableName = htmlNode.value.match(/{{(\S*)}}/);

      if(variableName && Object.keys(attrs).length) {
        attrs.varName = variableName[1];
        variables.push(attrs);
      }

    }
    if(htmlNode.childNodes) {
      for(var i = 0; i < htmlNode.childNodes.length; i++) {
        parseNodeRecursive(htmlNode.childNodes[i], variables);
      }
    }
  }

  function analyseAttrs(attrs) {

    var parsedAttributes = {};

    attrs.forEach(function(attr) {
      var name = attr.name.match(/data-bo-(\S*)/);
      if(name) {
        parsedAttributes[name[1]] = attr.value;
      }
    });

    return parsedAttributes;

  }

  //console.log(parse5.parse(fileContent).childNodes[0].childNodes[1].childNodes[0]); //html --> body --> goal element
  console.log(variables); //html --> body --> goal element

  //1. Find all handlebars elements by searching for {{*}}
  //2. Analyse to filter out helpers (start with #)
  //3. Read configuration header
  //4. return this as Template

};

readTemplates.saveToDB = function(template) {

  //Save Template to DB

};

module.exports = readTemplates;

