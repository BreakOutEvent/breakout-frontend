'use strict';

const fs = require('fs');
const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      timestamp: true
    })
  ]
});

module.exports = logger;