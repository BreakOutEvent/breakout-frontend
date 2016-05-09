'use strict';

const co = require('co');
const request = require('co-request');
const assert = require('assert');

const all = require('./all');

describe('dummy', function () {
  before(all.before);

  it('Dummy test, ensures server is up and running', done => co(function*() {
    yield request.get(all.baseUrl);
    done();
  }).catch(ex => {
    done(ex);
  }));

  after(all.after);
});

