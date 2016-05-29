'use strict';

let i18n = requireLocal('services/i18n');

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

exports.json = function (context) {
  return JSON.stringify(context);
};

exports.relativeTime = function (timestamp) {

  function leftPad(zahlen) {
    let string = '00' + zahlen;
    return string.substring(string.length - 2);
  }

  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  let dO = new Date(timestamp * 1000);
  let now = Date.now();
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
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
};

exports.smallestImage = (sizes) => {

  console.log(sizes);

  if (Array.isArray(sizes) && sizes.length > 0) {
    var minSize = sizes[0].size;
    var url = sizes[0].url;

    sizes.forEach((thisSize) => {
      if (thisSize.size < minSize) {
        minSize = thisSize.size;
        url = thisSize.url;
      }
    });

    return url;
  }
};

exports.round = (amount) => {
  return Math.round(parseFloat(amount) * 100) / 100;
};

exports.prettyLocation = (location) => {
  //Check if it exists.
  if(!location) return '';

  var locString = '';

  //Check for best Level
  if(location.hasOwnProperty('LOCALITY')) {
    locString = location.LOCALITY;
  } else if(location.hasOwnProperty('ADMINISTRATIVE_AREA_LEVEL_3')) {
    locString = location.ADMINISTRATIVE_AREA_LEVEL_3;
  } else if (location.hasOwnProperty('ADMINISTRATIVE_AREA_LEVEL_2')) {
    locString = location.ADMINISTRATIVE_AREA_LEVEL_2;
  } else if (location.hasOwnProperty('ADMINISTRATIVE_AREA_LEVEL_1')) {
    locString = location.ADMINISTRATIVE_AREA_LEVEL_1;
  }

  if(location.hasOwnProperty('COUNTRY')) {
    if(locString !== '') {
      locString += ', '
    }
    locString += location.COUNTRY;
  }
  if(locString !== '') {
    locString = ' in ' + locString;
  }
  return locString;
};