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
  templatePath: path.normalize(__dirname + "/../templates/"),
  defaultType: "text"
};
var readTemplates = {};


//Actual Code
readTemplates.init = function () {
  console.log(config.templatePath);
  var filelist = readTemplates.readFromFolder(config.templatePath);
  console.log(filelist);
  filelist.forEach(function (filename) {
    //Load File?
    var fileContent = fs.readFileSync(config.templatePath + filename, {encoding: 'utf8'});
    readTemplates.parseTemplate(filename, fileContent);
  });
};

readTemplates.readFromFolder = function (path) {
  return fs.readdirSync(path) || [];
};

readTemplates.parseTemplate = function (filename, fileContent) {

  var variables = fileContent.match(/{{([a-zA-Z0-1#\/\s]*)}}/g) || [];
  try {
    var config = JSON.parse(fileContent.match(/<!--((?:\n|.)*)-->/)[1]);
  } catch (e) {
    throw "Could not parse config in file " + filename + "! Maybe invalid JSON?\n Error: " + e;
  }

  var hasVariables = !!variables.length;
  var hasConfig = !!Object.keys(config).length;

  var localTemplate = new Template({
    title: path.basename(filename),
    vars: []
  });

  if (hasConfig) {
    //Best Case
    //Overwrite prefilled information with values from config
    if (config.hasOwnProperty('title')) {
      localTemplate.title = config.title;
    }

    if (config.hasOwnProperty('name')) {
      localTemplate.name = config.name;
    }

    //Validate config vs content
    var mismatches = [];
    if (config.hasOwnProperty('vars')) {
      mismatches = checkMisMatch(config.vars, variables);
    } else {
      mismatches = checkMisMatch({}, variables);
    }


  } else if (!hasVariables && hasConfig) {
    //Probably only general information


  } else if (hasVariables && !hasConfig) {
    //Warn about unusual situation
    console.warn("Found variables but no config in file " + filename);

    //TODO fill everything with default information
  } else {
    //No Config & No Variables
    return localTemplate;
  }

  function checkMisMatch(configVars, contentVars) {

    var sanContentVars = analyseContentVars(contentVars);

  }

  function analyseContentVars(contentVars) {

    //Sanitize Input
    for (var i = 0; i < contentVars.length; i++) {
      contentVars[i] = contentVars[i].match(/{{(.*)}}/)[1];
    }

    var finalContentVars = {};

    readVariable(finalContentVars, contentVars);

    return finalContentVars;

    for (var j = 0; j < contentVars.length; j++) {
      var contentVar = contentVars[j];

    }
  }

  function readVariable(finalContentVars, contentVars) {
    //Read first element
    var contentVar = contentVars[0];
    //Remove first element
    contentVars.shift();

    //Special variable?
    if (contentVar.charAt(0) === '#') {
      if (contentVar.substring(1, 5) === 'each') {
        //Get actual variable
        var words = contentVar.split(' ');
        //Check what else is contained in #each


        //TODO rewrite it to be recursive... (issue: no hierarchy exists)


        for (var x = j; x < contentVars.length; x++) {
          if (contentVars[x].search(/^\/each/)) {
            j = ++x;
            break;
          } else {

            //Check potential error in template
            if (x == contentVars.length - 1) {
              throw "A #each has not been closed...";
            } else {
              x++;
            }
          }
        }

        finalContentVars[words[words.length - 1]] = {};


      } else if (contentVar.substring(1, 3) === 'if') {

      } else {
        //Handle Fail
      }
    }
  }

  function searchAllChilds(nodes, variables) {
    if (nodes) {
      for (var i = 0; i < nodes.length; i++) {
        parseNodeRecursive(nodes[i], variables);
      }
    }
  }

  function checkAttributesForHandlebars(attrs) {

    var returnvalue = [];

    for (var i = 0; i < attrs.length; i++) {
      //regex every attribute value
      var variableName = parseText(attrs[i].value);
      if (variableName) {
        //Found a variable
        returnvalue.push({"name": attrs[i].name, "value": variableName});
        //Keep it running, maybe we find some more.
      }
    }

    return returnvalue;
  }

  function parseText(text) {
    var variableName = text.match(/{{(.*)}}/);
    if (variableName) {
      return variableName[1].trim();
    }
    return null;
  }

  function analyseAttrs(attrs) {

    var parsedAttributes = {};

    attrs.forEach(function (attr) {
      var name = attr.name.match(/data-bo-(\S*)/);
      if (name) {
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

readTemplates.saveToDB = function (template) {

  //Save Template to DB

};

module.exports = readTemplates;

