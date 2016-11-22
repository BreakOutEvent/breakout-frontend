/* eslint-disable */
/* TODO: Check globals for this file */

'use strict';


const assert = require('assert');
const co = require('co');

const all = require('../all');

const email = 'breakouttesting+' + new Date().getTime() + '@gmail.com';

describe('funnel', function () {

  // it('dummy test', (done) => co(function*() { done(); }).catch(ex => done(ex)));

  it('should have the right title', (done) => co(function*() {
    const title = yield browser.url(all.baseUrl).getTitle();
    assert.equal(title, 'Anmeldung zu BreakOut 2016 -');

    done();
  }).catch(ex => done(ex)));

  it('registers a new user successfully', (done) => co(function*() {
    yield browser
      .setValue('input[name="email"]', email)
      .setValue('input[name="password"]', 'testaccount')
      .setValue('input[name="password_repeat"]', 'testaccount')
      .click('#mainCTA')
    ;

    const success = yield browser.waitForExist('h2#test-headline').getText('h2#test-headline');

    assert.equal(success, 'Erfolgreich Registriert');

    done();
  }).catch(ex => done(ex)));

  it('gives the right options on /selection', (done) => co(function*() {
    const text = yield browser.getSource();
    assert.notEqual(text.indexOf('Jetzt Teilnehmer werden'), -1);
    done();
  }).catch(ex => done(ex)));

  it('starts registration as a participant', (done) => co(function*() {
    yield browser.click('#test-participant');
    yield browser.waitForExist('#registrationForm');
    done()
  }).catch(ex => done(ex)));

  it('fills out the personal data', (done) => co(function*() {
    yield browser
      .click('#male')
      .setValue('#firstname', 'TestVorname')
      .setValue('#lastname', 'TestNachname')
      .selectByIndex('#tshirtsize', 1)
      .setValue('#phonenumber', '1234567890')
      .setValue('#emergencynumber', '1234567891')
      .click('#terms_accepted')
      .click('#code_accepted')
      .click('#age_accepted')
      .click('#mainCTA')
      .waitForExist('#teamForm')
    ;

    done();
  }).catch(ex => done(ex)));

  it('Creates an empty team', (done) => co(function*() {

    // TODO: Continue here

    done();
  }).catch(ex => done(ex)));

  it('waits', (done) => co(function*() {
    yield new Promise((resolve, reject) => setTimeout(resolve, 60000));
    done();
  }).catch(ex => done(ex)));

});
