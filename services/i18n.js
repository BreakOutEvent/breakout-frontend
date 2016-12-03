'use strict';

/**
 * Service for translating given keys.
 * @type {string}
 */

const langData = requireLocal('services/translations');
const logger = require('../services/logger');

const FALLBACK = 'de';

let i18n = {};

i18n.init = (req, res, next) => {
  let lang = req.acceptsLanguages();

  lang = lang === '*' ? FALLBACK : lang;

  if (Array.isArray(lang)) {
    req.language = lang[0].substring(0, 2);
  } else {
    req.language = lang;
  }

  if (!lang) {
    logger.warn('Found no accepted-languages header.');
    req.language = FALLBACK;
  }

  if (IS_TEST) {
    req.language = 'de';
  }

  next();
};

i18n.translate = (view, key, lang) => {
  if (langData.hasOwnProperty(view)) {
    if (langData[view].hasOwnProperty(key)) {
      if (langData[view][key].hasOwnProperty(lang)) {
        return langData[view][key][lang];
      } else {
        logger.warn(`Unknown language ${lang} in key ${key} from view ${view}! Using Fallback`);
        return langData[view][key][FALLBACK];
      }
    } else {
      throw `Unknown key ${key} in view ${view}`;
    }
  } else {
    throw `Unknown view ${view}`;
  }
};

module.exports = i18n;
