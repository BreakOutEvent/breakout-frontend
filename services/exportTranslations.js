'use strict';

const de = require('../resources/translations/translations.de');
const en = require('../resources/translations/translations.en');

function generateKeymap(languageFile) {
  let entries = [];

  function generate(path, obj) {

    if (typeof obj === 'string') {
      entries.push({
        path: path,
        value: obj
      });
      return;
    }

    for (let key in obj) {
      const joinedKey = path + '.' + key;
      generate(joinedKey, obj[key]);
    }
  }

  generate('', languageFile);
  return entries;
}

const germanKeymap = generateKeymap(de);
const englishKeymap = generateKeymap(en);

for (let entry of germanKeymap) {
  const path = entry.path;
  const englishValue = lookupValueFromKeymap(path, englishKeymap);
  const germanValue = entry.value;

  const escapedPath = path.slice(1, path.length).replace(/"/g, '""');
  const escapedEn = englishValue.replace(/"/g, '""');
  const escapedDe = germanValue.replace(/"/g, '""');

  // eslint-disable-next-line no-console
  console.log(`"${escapedPath}","${escapedDe}" ,"${escapedEn}"`);
}

function lookupValueFromKeymap(path, keymap) {
  const matches = keymap.filter(entry => entry.path === path);
  if (matches.length === 0) {
    return 'MISSING';
  } else if (matches.length === 1) {
    return matches[0].value;
  } else {
    throw Error('More than one element for path ' + path);
  }
}