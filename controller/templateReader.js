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
readTemplates.init = function () {
  console.log(config.templatePath);
  var filelist = readTemplates.readFromFolder(config.templatePath);
  console.log(filelist);
  filelist.forEach(function (file) {
    //Load File?
    var fileContent = fs.readFileSync(config.templatePath + file, {encoding: 'utf8'});
    readTemplates.parseTemplate(fileContent);
  });
};

readTemplates.readFromFolder = function (path) {
  return fs.readdirSync(path) || [];
};

readTemplates.parseTemplate = function (fileContent) {

  if (fileContent.search(/{{.*}}/) === -1) {
    return;
  }

  var htmlObj = parse5.parse(fileContent).childNodes[0].childNodes[1].childNodes[0]; //html --> body --> goal element
  var variables = {};

  parseNodeRecursive(htmlObj, variables);

  function parseNodeRecursive(htmlNode, variables) {
    var attrs = {}, variableName = "";
    var val = htmlNode.value ? htmlNode.value.trim() : "noting";
    console.log(htmlNode.nodeName, val);

    if (htmlNode.nodeName !== '#text') {
      //For all normal nodes
      attrs = analyseAttrs(htmlNode.attrs);
      if (Object.keys(attrs).length > 0) {
        //Okay it has data-bo attrs, which suggests that there is some handlebars tag somewhere

        //Check if the first child node exists and is a text
        if (htmlNode.childNodes[0] && htmlNode.childNodes[0].nodeName === '#text') {
          var text = parseText(htmlNode.childNodes[0].value);

          //If it contains a space, its very likely to be a special shit
          if (text && text.search(" ") == -1 && text.search("#") == -1) {
            //normal variable, phew!

            //Add variable to global constant
            variables[text] = attrs;

            //Remove the text element from the array
            searchAllChilds(htmlNode.childNodes.shift(), variables);

          } else {
            //Cloud be just a helper or each / if
            if (!text) {
              //Well it contains no text, so we have to search for the {{}} in the attributes
              var attributes = checkAttributesForHandlebars(htmlNode.attrs);

              attributes.forEach(function(attribute) {
                variables[attribute.value] = attrs;
              });


              //TODO use the attributes to fill the variables

            } else if (text.search('#') == -1) {
              //Okay not each / if as they start with a #
              var words = text.split(' ');
              //So the interesting part will be always the last word, as this is the variable
              variables[words[words.length - 1]] = attrs;
              searchAllChilds(htmlNode.childNodes.shift(), variables);

            } else if (text.search('#') > 0) {
              //Each / if ....
              //TODO handle if / each, should be done by some block detection
            } else {
              //TODO handle this case
            }
          }
        } else {
          //TODO Check other nodes for text and for handlebars

        }


      } else {
        //TODO what happens if its not a valid html from the beginning?
        //No data-bo attributes, just continue as normal
        searchAllChilds(htmlNode.childNodes, variables);
      }

    } else {
      //A single textnode

      attrs = analyseAttrs(htmlNode.parentNode.attrs);
      variableName = parseText(htmlNode.value);

      if (variableName && Object.keys(attrs).length) {
        variables[variableName[1]] = attrs;
      }

      //TODO iterate over childs
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
      if(variableName) {
        //Found a variable
        returnvalue.push({"name":attrs[i].name, "value":variableName});
        //Keep it running, maybe we find some more.
      }
    }

    return returnvalue;
  }

  function parseText(text) {
    var variableName = text.match(/{{(.*)}}/);
    if(variableName) {
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

