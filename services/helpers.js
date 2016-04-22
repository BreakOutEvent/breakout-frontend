'use strict';

let i18n = requireLocal('services/i18n');

exports.concat = (first, second) => first + second;

exports.__ = (text, options) => {

  if (!options.data.root.lang) {
    throw 'You did not pass the language to handlebars!';
  }

  let viewArr = options.data.exphbs.view.split('\\');

  return i18n.translate(viewArr[viewArr.length - 1].toUpperCase(), text.toUpperCase(), options.data.root.lang);
};
