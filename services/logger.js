'use strict';

const fs = require('fs');
const bunyan = require('bunyan');

let logger;

const bunyanConfig = {
  name: 'breakout-frontend',
  streams: [
    {
      level: 'info',
      stream: fs.createWriteStream(ROOT + '/logs/info.log', {flags: 'a'})
    },
    {
      level: 'error',
      stream: fs.createWriteStream(ROOT + '/logs/error.log', {flags: 'a'})
    }
  ],
  serializers: bunyan.stdSerializers,
  src: process.env.NODE_ENVIRONMENT !== 'prod'
};

// TODO: There should be a better way for this!
if(process.env.IS_TEST) {
  logger.info = () => {};
  logger.error = () => {};
  logger.warn = () => {};
}

logger = bunyan.createLogger(bunyanConfig);
module.exports = logger;