/**
 * Created by Ardobras on 20.04.2016.
 */
'use strict';

const FALLBACK = 'en';
const langData = requireLocal('services/translations');

let i18n = {};

i18n.init = (req, res, next) => {
  let lang = req.acceptsLanguages();
  if (Array.isArray(lang)) {
    req.lang = lang[0].substring(0, 2);
  } else {
    req.lang = lang;
  }

  if (!lang) {
    logger.warn('Found no accepted-languages header.');
    req.lang = FALLBACK;
  }

  next();
};

i18n.translate = (view, key, lang) => {
  if (langData.hasOwnProperty(view)) {
    if (langData[view].hasOwnProperty(key)) {
      if (langData[view][key].hasOwnProperty(lang)) {
        return langData[view][key][lang];
      } else {
        throw `Unknown language ${lang} in key ${key} from view ${view}`;
      }
    } else {
      throw `Unknown key ${key} in view ${view}`;
    }
  } else {
    throw `Unknown view ${view}`;
  }
};

module.exports = i18n;
