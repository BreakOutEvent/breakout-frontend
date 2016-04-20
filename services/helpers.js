'use strict';

let i18n = requireLocal('services/i18n');

exports.concat = (first, second) => first + second;

exports.__ = (text, options) => {

  console.log(options);

  if(!options.data.root.lang) {
    throw 'You did not pass the language to handlebars!';
  }

  let viewArr = options.data.exphbs.view.split('\\');
  let view = viewArr[viewArr.length - 1];

  return i18n.translate(view.toUpperCase(), text.toUpperCase(), options.data.root.lang);
};