'use strict';

let i18n = requireLocal('services/i18n');

exports.concat = (first, second) => first + second;

exports.__ = (text, options) => {

  if (!options.data.root.lang) {
    throw 'You did not pass the language to handlebars!';
  }

  const view = options.data.exphbs.view;
  let viewArr = [];

  if(view.indexOf('\\') > -1 ) {
    viewArr = view.split('\\');
  } else {
    viewArr = view.split('/');
  }

  return i18n.translate(viewArr[viewArr.length - 1].toUpperCase(), text.toUpperCase(), options.data.root.lang);
};
