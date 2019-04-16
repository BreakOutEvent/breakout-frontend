'use strict';

// Load modules
const i18n = require('../services/i18n');
const fs = require('fs');
var dateFormat = require('dateformat');
const Remarkable = require('remarkable');
const path = require('path');
const logger = require('../services/logger');
const config = require('../config/config');
const _ = require('lodash');

// Setup
const md = new Remarkable({
  html: true
});

exports.toId = (input) => {
  return input.replace(/ /g, '');
};

exports.clientConfig = () => {
  return JSON.stringify({
    baseUrl: process.env.REACT_BASEURL || config.react.baseUrl,
    clientSecret: process.env.REACT_CLIENT_SECRET || config.react.clientSecret,
    clientId: process.env.REACT_CLIENT_ID || config.react.clientId
  });
};

exports.cloudinaryConfig = () => JSON.stringify({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key
});

exports.transform = function (parameters, url) {
  if (!url) {
    return;
  }

  let newUrl;
  if (!url.includes('cloudinary')) {
    // cannot transform images that are not from cloudinary
    var myRegexp = /w_(\d+)/g;
    var match = myRegexp.exec(parameters);

    newUrl = 'https://images.break-out.org/' + match[1] + 'x,q80/' + url;
    return newUrl;
  } else {
    newUrl = url.replace(/image\/upload\/.*\//, `image/upload/${parameters}/`);
    return newUrl;
  }
};

exports.transformVideo = function (parameters, url) {
  if (!url) {
    return;
  }

  let newUrl;
  if (!url.includes('cloudinary')) {
    // cannot transform images that are not from cloudinary
    return url;
  } else {
    newUrl = url.replace(/video\/upload\/.*\//, `video/upload/${parameters}/`);
    return newUrl;
  }
};

exports.stringify = (obj) => {

  if (!obj) {
    return false;
  }

  return JSON.stringify(obj);
};

exports.thumbnail = (videoUrl, ctx) => {
  try {

    if (videoUrl.includes('breakoutmedia.blob.core.windows.net')) {
      // this video is served from our old azure blob storage where
      // we can't just change the extension to get a thumbnail
      // Instead we do nothing and have a black "thumbnail"
      return '';
    }

    // replace the ending of the video with .png. This will use cloudinary
    // to automatically generate a thumbnail based on the video url for us
    return videoUrl.substr(0, videoUrl.lastIndexOf('.')) + '.png';

  } catch (err) {
    logger.error(`Error parsing thumbnail url for url '${videoUrl}'`);
  }
};

function changeExtension(videoUrl, newExtension) {
  try {
    if (videoUrl.includes('breakoutmedia.blob.core.windows.net')) {
      // this video is served from our old azure blob storage where
      return videoUrl;
    }

    // replace the ending of the video with .png. This will use cloudinary
    // to automatically generate a thumbnail based on the video url for us
    return videoUrl.substr(0, videoUrl.lastIndexOf('.')) + '.' + newExtension;

  } catch (err) {
    logger.error(`Error changing extension to ${newExtension} for url '${videoUrl}'`);
  }
}

exports.changeExtension = changeExtension;

exports.transformVideoAndExtension = (format, extension, videoUrl, ctx) => {
  let newUrl = changeExtension(videoUrl, extension);
  return exports.transformVideo(format, newUrl, ctx);
};

/**
 * Concatenates first and second.
 * @param first
 * @param second
 */
exports.concat = (first, second) => first + second;

/**
 * Returns true if v1 == v2.
 * @param v1
 * @param v2
 * @param options
 * @returns {*}
 */
exports.ifCond = function (v1, v2, options) {

  if (v1 === v2) {
    return options.fn(this);
  }

  return options.inverse(this);
};

exports.weakIfCond = function (v1, v2, options) {

  if (v1 == v2) {
    return options.fn(this);
  }

  return options.inverse(this);
};

exports.fixed = function (v1, options) {
  let number = new Number(options.fn(this));
  return number.toFixed(v1);
};

exports.isEven = function (context) {
  if ((context.data.index % 2) === 0) {
    return context.fn(this);
  } else {
    return context.inverse(this);
  }
};

exports.isOdd = function (context) {
  if ((context.data.index % 2) !== 0) {
    return context.fn(this);
  } else {
    return context.inverse(this);
  }
};

exports.isLast = function (context) {
  if (context.data.last) {
    return context.fn(this);
  } else {
    return context.inverse(this);
  }
};

/**
 * Render markdown from content/mdFileName to html
 * @param mdFileName
 * @returns rendered html
 */
exports.markdown = function renderMarkdown(mdFileName, context) {
  const rawMd = loadFileContent(mdFileName);
  const html = md.render(rawMd);
  return html;
};

exports.date = function makeDate(timestamp, context) {
  return new Date(timestamp);
};

exports.beautifuldate = function makeDate(timestamp, context) {
  if (timestamp == null) {
    return 'No Date Available';
  }

  let date = new Date(timestamp);
  let beautifuldate = dateFormat(date, 'dS mmmm, h:MM TT');
  return beautifuldate;
};

exports.md = function renderMarkdown(rawMd, context) {
  const html = md.render(rawMd);
  return html;
};

exports.contentfulImage = function (imageObject, clazz, id, context) {

  clazz = (clazz != null) ? clazz : '';
  id = (id != null) ? id : '';

  const url = imageObject.fields.file.url;
  const alt = (imageObject.fields.description != null) ? imageObject.fields.description : '';

  return `<img src="${url}" alt="${alt}" class="${clazz}" id="${id}"/>`;
};

function loadFileContent(mdFileName) {
  const path = getFilepath(mdFileName);
  return fs.readFileSync(path, 'utf-8');
}

function getFilepath(mdFileName) {
  const contentFolderPath = path.resolve('content/');
  return `${contentFolderPath}/${mdFileName}.md`;
}

/**
 * Tries to find the matching translation for the language the browser sent us.
 * @param text
 * @param options
 * @private
 */
exports.__ = (text, options) => {

  if (!options.data.root.language) {
    throw 'You did not pass the language to handlebars!';
  }

  const view = options.data.exphbs.view;
  let viewArr = [];

  if (view) {
    if (view.indexOf('\\') > -1) {
      viewArr = view.split('\\');
    } else {
      viewArr = view.split('/');
    }
  }

  if (text.indexOf('.') > -1) {
    viewArr = text.split('.');
    text = viewArr.pop();
  } else if (!view) {
    logger.error(`Could not parse view in ${options.data.exphbs}`);
  }

  return i18n.translate(viewArr[viewArr.length - 1].toUpperCase(), text.toUpperCase(), options.data.root.language);
};

exports.ifOr = function (v1, v2, options) {
  if (v1 || v2) {
    return options.fn(this);
  }

  return options.inverse(this);
};

/* eslint-disable no-console */
exports.debug = function (optionalValue) {
  console.log('Current Context');
  console.log('====================');
  console.log(this);

  if (optionalValue) {
    console.log('Value');
    console.log('====================');
    console.log(optionalValue);
  }
};
/*eslint-enable no-console */

exports.json = function (context) {
  return JSON.stringify(context);
};

exports.getAtIndex = function (array, index) {
  return array[index];
};

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
exports.hash = (str, seed) => {
  /*jshint bitwise:false */
  var i, l,
    hval = (seed === undefined) ? 0x811c9dc5 : seed;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }

  // Convert to 8 digit hex string
  return ('0000000' + (hval >>> 0).toString(16)).substr(-8);

};

exports.relativeTime = function (timestamp) {

  function leftPad(zahlen) {
    let string = '00' + zahlen;
    return string.substring(string.length - 2);
  }

  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  let dO = new Date((timestamp + (60 * 60 * 2)) * 1000);

  // TODO: Hack for timezone! Fix this in 2018
  let now = new Date(Date.now() + 60 * 60 * 2 * 1000);
  let difference = now - dO.getTime();
  if (difference < 60 * 1000) {
    return 'Gerade eben';
  } else if (difference < 60 * 60 * 1000) {
    return `vor ${Math.floor(difference / 60 / 1000)} Minuten`;
  } else if (difference < 60 * 60 * 24 * 1000) {
    return `vor ${Math.floor(difference / 60 / 60 / 1000)} Stunden`;
  } else {
    return `am ${dO.getDate()}. ${MONTHS[dO.getMonth()]} um ${dO.getHours()}:${leftPad(dO.getMinutes())}`;
  }
};

exports.length = function (array) {
  return array.length;
};

exports.strColor = (str) => {
  if (!str) {
    return 'gray';
  }

  var hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (let i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
};

exports.round = (amount) => {
  return Math.round(parseFloat(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

exports.roundWithoutFormat = (amount) => {
  return Math.round(parseFloat(amount));
};

exports.addOne = (amount) => {
  return (parseFloat(amount) + 1);
};

exports.prettyLocation = (location) => {
  //Check if it exists.
  if (!location) return '';

  var locString = '';

  //Check for best Level
  if (location.hasOwnProperty('LOCALITY')) {
    locString = location.LOCALITY;
  } else if (location.hasOwnProperty('ADMINISTRATIVE_AREA_LEVEL_3')) {
    locString = location.ADMINISTRATIVE_AREA_LEVEL_3;
  } else if (location.hasOwnProperty('ADMINISTRATIVE_AREA_LEVEL_2')) {
    locString = location.ADMINISTRATIVE_AREA_LEVEL_2;
  } else if (location.hasOwnProperty('ADMINISTRATIVE_AREA_LEVEL_1')) {
    locString = location.ADMINISTRATIVE_AREA_LEVEL_1;
  }

  if (location.hasOwnProperty('COUNTRY')) {
    if (locString !== '') {
      locString += ', ';
    }
    locString += location.COUNTRY;
  }
  if (locString !== '') {
    locString = ' in ' + locString;
  }
  return locString;
};

exports.challengeHasProof = (status) => {
  return status === 'WITH_PROOF';
};

exports.isOlderTenMinutes = (date, context) => {
  if ((new Date(date * 1000 + 10 * 60 * 1000).getTime() < new Date().getTime())) {
    return context.fn(this);
  } else {
    return context.inverse(this);
  }
};

exports.isNewerTenMinutes = (date, context) => {
  if ((new Date(date * 1000 + 10 * 60 * 1000).getTime() > new Date().getTime())) {
    return context.fn(this);
  } else {
    return context.inverse(this);
  }
};

exports.displayCurrency = (amount, context) => Number(amount).toFixed(2);

/**
 * This handlebars helper will render a block in the handlerbars file if the config value is true
 *
 * Example:
 *
 * {{#isEnabled 'printHeadline.enabled'}} <h1>I am a headline </h1> {{/isEnabled}}
 *
 * @param key The config key to look up
 * @param context Handlebars context
 * @returns {string} Either the block to be rendered or an empty string
 */
exports.isEnabled = function (key, context) {

  const value = _.get(config, key);

  if (value === true) {
    return context.fn(this);
  } else if (value === false) {
    return '';
  } else {
    throw new Error(`Found value '${value}' for config key '${key}'. Expected boolean value`);
  }
};

/**
 * Returns the value for a key from the config file
 *
 * Example: {{config 'backend.accessToken'}} will render the accessToken into the handlebars file
 *
 * @param key The config key to look up
 * @param context Handlebars context
 * @returns {*} The value found for the given key
 */
exports.config = function (key, context) {
  const value = _.get(config, key);
  if (value) {
    return value;
  } else {
    throw new Error(`Couldn't find value for key '${key}' in configuration`);
  }
};
