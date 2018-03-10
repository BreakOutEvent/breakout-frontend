'use strict';

/**
 * Service for translating given keys.
 * @type {string}
 */

// const langData = require('../services/translations');
const logger = require('../services/logger');
const i18next = require('i18next');

const de = require('../../common/resources/translations/translations.de.js');
const en = require('../../common/resources/translations/translations.en.js');

i18next.init({
  fallbackLng: 'en',
  resources: {
    de: {
      translation: de
    },
    en: {
      translation: en
    }
  }
});

const FALLBACK = 'en';

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
  return i18next.t(`${view}.${key}`, {lng: lang});
};

module.exports = i18n;
