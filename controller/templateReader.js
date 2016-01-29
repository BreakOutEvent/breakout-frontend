'use strict';

//3rd Party Dependencies
var fs = require('fs');
var path = require('path');

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
    var parsedTemplate = readTemplates.parseTemplate(filename, fileContent);
    //TODO adjust vars to template or the other way around
    console.log(parsedTemplate);
    //parsedTemplate.save();
  });
};

readTemplates.readFromFolder = function (path) {
  return fs.readdirSync(path) || [];
};

readTemplates.parseTemplate = function (filename, fileContent) {

  var contentVars = analyseContentVars(fileContent.match(/{{([a-zA-Z0-1#\/\s]*)}}/g) || []);
  try {
    var config = JSON.parse(fileContent.match(/<!--((?:\n|.)*)-->/)[1]);
  } catch (e) {
    throw "Could not parse config in file " + filename + "! Maybe invalid JSON?\n Error: " + e;
  }

  var hasVariables = !!contentVars.length;
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

    var configVars = config.hasOwnProperty('vars') ? config.vars : {};

    localTemplate.vars = fillWithDefault(mergeVars(configVars, contentVars));

  } else if (hasVariables && !hasConfig) {
    //Warn about unusual situation
    console.warn("Found variables but no config in file " + filename);

    localTemplate.vars = fillWithDefault(mergeVars({}, contentVars));

  } else {
    //No Config & No Variables
    return localTemplate;
  }

  function mergeVars(configVars, contentVars) {

    var configKeys = Object.keys(configVars) || [];
    var contentKeys = Object.keys(contentVars) || [];

    var mergedVars = {};

    contentKeys.forEach(function (contentKey) {
      if (typeof contentVars[contentKey] === 'object') {
        if (typeof configVars[contentKey] === 'object') {
          mergedVars[contentKey] = mergeVars(configVars[contentKey], contentVars[contentKey]);
        } else {
          console.warn('Found no config for ' + contentKey);
          mergedVars[contentKey] = mergeVars({}, contentVars[contentKey]);
        }
      } else {
        if (typeof configVars[contentKey] === 'object') {
          throw 'Trying to map a config object to non-object property on ' + contentKey;
        }
        //Config available
        if (configVars.hasOwnProperty(contentKey)) {
          if(checkValidOption(contentKey, configVars[contentKey])) {
            mergedVars[contentKey] = configVars[contentKey];
          }
        } else {
          if(checkValidOption(contentKey, contentVars[contentKey])) {
            mergedVars[contentKey] = contentVars[contentKey];
          }
        }
      }
    });

    configKeys.forEach(function (configKey) {
      //All object configs should already be used. Everything else can not be used.
      if (typeof configVars[configKey] !== 'object') {
        if (!mergedVars.hasOwnProperty(configKey)) {
          if(checkValidOption(configKey, configVars[configKey])) {
            mergedVars[configKey] = configVars[configKey];
          }
        }
      }
    });

    return mergedVars;

    function checkValidOption(key, value) {
      var returnvalue = false;
      switch (key) {
        case 'name':
          returnvalue = /^[a-zA-Z0-9]*$/.test(value);
          break;
        case 'title':
          returnvalue = true;
          break;
        case 'child':
          returnvalue = typeof value === 'object';
          break;
        case 'maxlen':
        case 'minlen':
        case 'maxheight':
        case 'maxwidth':
        case 'minheight':
        case 'minwidth':
          returnvalue = !isNaN(parseInt(value));
          break;
        case 'type':
          returnvalue = ['text', 'number', 'file', 'array', 'bool', 'url'].indexOf(value) > -1;
          break;
        default:
          returnvalue = false;
          break;
      }
      if(!returnvalue) {
        console.warn('The key "' + key + '" with the value "' + value + '" has not passed the validity check.')
      }
      return returnvalue;
    }

  }

  function fillWithDefault(variables) {

    Object.keys(variables).forEach(function(key) {
      if (typeof variables[key] === 'object') {

        //Check for name
        if(!variables[key].hasOwnProperty('name')) {
          variables[key].name = key;
        }

        //Check for type
        if(!variables[key].hasOwnProperty('type')) {
          variables[key].type = 'text';
        }

        //Check for title
        if(!variables[key].hasOwnProperty('title')) {
          variables[key].type = key;
        }

        if(variables[key].type === 'array' && variables[key].hasOwnProperty['']) {
          variables[key].child = fillWithDefault(variables[key].child);
        }

      }
    });
    return variables;
  }

  function analyseContentVars(contentVars) {

    //Sanitize Input
    for (var i = 0; i < contentVars.length; i++) {
      contentVars[i] = contentVars[i].match(/{{(.*)}}/)[1];
    }

    var finalContentVars = {};

    while (contentVars.length > 0) {
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
        res.child = iterateOverChildren(contentVars, 'each');

      } else if (contentVar.substring(1, 3) === 'if') {
        res.name = extractVarName(contentVar);
        res.type = "bool";
        res.child = iterateOverChildren(contentVars, 'if');

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

  function iterateOverChildren(contentVars, breakString) {
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
    return res;
  }

  //console.log(parse5.parse(fileContent).childNodes[0].childNodes[1].childNodes[0]); //html --> body --> goal element

  //1. Find all handlebars elements by searching for {{*}}
  //2. Analyse to filter out helpers (start with #)
  //3. Read configuration header
  //4. return this as Template

  return localTemplate;
};

readTemplates.saveToDB = function () {

  //Save Template to DB

};

module.exports = readTemplates;