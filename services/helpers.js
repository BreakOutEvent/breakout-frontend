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

  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November', 'Dezember'];
  let dO = new Date(timestamp * 1000);
  let now = Date.now();
  let difference = now - timestamp;
  if(difference < 60) {
    return 'Gerade eben';
  } else if(difference < 60 * 60) {
    return `vor ${Math.floor(difference / 60)} Minuten`;
  } else if(difference < 60 * 60 * 24) {
    return `vor ${Math.floor(difference / 60 / 60)} Stunden`;
  } else {
    return `am ${dO.getDate()}. ${MONTHS[dO.getMonth()]} um ${dO.getHours()}:${leftPad(dO.getMinutes())}`;
  }
};

exports.length = function (array) {
  return array.length;
};

