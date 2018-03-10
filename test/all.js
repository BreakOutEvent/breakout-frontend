'use strict';

const app = require('../src/server/app');

let server = null;

const beforeHandler = (done) => app(srv => server = srv).then(() => done());

const afterHandler = () => server.close();

module.exports = {
  before: beforeHandler,
  after: afterHandler,
  baseUrl: 'http://localhost:8080'
};
