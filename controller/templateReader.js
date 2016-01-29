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

    console.log(analyseContentVars(contentVars));

  }

  function analyseContentVars(contentVars) {

    //Sanitize Input
    for (var i = 0; i < contentVars.length; i++) {
      contentVars[i] = contentVars[i].match(/{{(.*)}}/)[1];
    }

    var finalContentVars = {};

    while(contentVars.length > 0) {
      var temp = readVariable(contentVars);
      finalContentVars[temp.result.name] = temp.result;
      contentVars = temp.remains;
    }

    return finalContentVars;
  }

  function readVariable(contentVars) {
    //Read first element
    var contentVar = contentVars[0], res = {};
    //Remove first element
    contentVars.shift();

    //Special variable?
    if (contentVar.charAt(0) === '#') {
      if (contentVar.substring(1, 5) === 'each') {
        //Get actual variable
        res.name = extractVarName(contentVar);
        res.type = "array";
        res.child = iterateOverChilds(contentVars, 'each');

      } else if (contentVar.substring(1, 3) === 'if') {
        res.name = extractVarName(contentVar);
        res.type = "bool";
        res.child = iterateOverChilds(contentVars, 'if');

      } else {
        throw "Unknown special command " + contentVar;
      }
    } else if (contentVar.search(' ') > -1) {
      //Remove helper
      res.name = extractVarName(contentVar);
    } else {
      //Normal variable
      res.name = contentVar.trim();
    }

    return {
      result: res,
      remains: contentVars
    }

  }

  function extractVarName(rawName) {
    var words = rawName.split(' ');
    return words[words.length - 1].trim();

  }

  function iterateOverChilds(contentVars, breakString) {
    var res = {};
    var breakCondition = new RegExp("^\/" + breakString);

    while (contentVars.length > 0) {
      if (contentVars[0].search(breakCondition) > -1) {
        contentVars.shift();
        break;
      } else {


        var temp = readVariable(contentVars);

        contentVars = temp.remains;
        res[temp.result.name] = temp.result;

        //Check potential error in template
        if (contentVars.length == 0) {
          throw "A #" + breakString + " has not been closed...";
        }
      }
    }
    console.log("iterateOverChild", res);
    return res;
  }

  function parseText(text) {
    var variableName = text.match(/{{(.*)}}/);
    if (variableName) {
      return variableName[1].trim();
    }
    return null;
  }

  //console.log(parse5.parse(fileContent).childNodes[0].childNodes[1].childNodes[0]); //html --> body --> goal element

  //1. Find all handlebars elements by searching for {{*}}
  //2. Analyse to filter out helpers (start with #)
  //3. Read configuration header
  //4. return this as Template

};

readTemplates.saveToDB = function (template) {

  //Save Template to DB

};

module.exports = readTemplates;

