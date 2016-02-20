/**
 * Created by Keno on 10.01.2016.
 */
'use strict';
var fs = require('fs');

//Define empty object
var dataLayer = {};

dataLayer.checkForRenderedFiles = function (folder, id) {

  return fs.readdirSync(__dirname + '/rendered/' + folder).filter(function (filename) {
      return filename.match(new RegExp(id + '-' + '\d*.html')) !== null;
    }) || [];

};

dataLayer.readRenderedFile = function (folder, id) {

  return fs.readFileSync(__dirname + '/../rendered/' + folder + '/' + id + '.html', {encoding: 'utf-8'});

};

dataLayer.readTemplateFile = function (folder, name) {

  return fs.readFileSync(__dirname + '/../templates/' + folder + '/' + name + '.handlebars', {encoding: 'utf-8'});

};

dataLayer.readDerFuehrer = function () {

  return dataLayer.readTemplateFile('', 'master');

};

module.exports = dataLayer;
