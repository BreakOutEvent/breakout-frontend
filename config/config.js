'use strict';

/* Allowed here, because no logger set up yet */
/* eslint no-console: 0 */

if (!process.env.NODE_ENVIRONMENT) {
  console.error('NODE_ENVIRONEMNT is not specified');
  process.exit(1);
}

const filename = `config-${process.env.NODE_ENVIRONMENT}.json`;
const path = `../${filename}`;

try {
  module.exports = require(path);
  console.info(`Using config '${filename}'`);
} catch (err) {
  console.error(`No config with filename ${filename} found`);
  process.exit(1);
}

