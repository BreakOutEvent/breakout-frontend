'use strict';

/**
 * Controller for the BreakOut-Member-Page.
 */

const Promise = require('bluebird');
const GoogleSpreadsheet = require('google-spreadsheet');
const co = require('co');
const _ = require('lodash');
const fs = require('co-fs-extra');
const config = requireLocal('config/config.js');

/**
 * GET route for the BreakOut-Member-Page.
 * @param language
 * @param res
 */
module.exports.teamPage = (language, res) => co(function*() {
  const cachePath = ROOT + '/rendered/cache/teams.json.cache';

  const fetchMemberList = () => co(function*() {
    const doc = new GoogleSpreadsheet(config.gdrive.document_id);
    var credsJson = {
      client_email: config.gdrive.client_email,
      private_key: config.gdrive.private_key.replace(/\\n/g, '\n')
    };

    logger.info('Trying to authenticate with Google Docs');
    yield Promise.promisify(doc.useServiceAccountAuth)(credsJson);
    logger.info('Authenticated with Google Docs');

    logger.info('Trying to get info from Google Docs');
    const info = yield Promise.promisify(doc.getInfo)();
    logger.info('Got info from Google Docs');
    const sheet = info.worksheets[0];

    logger.info('Trying to get all rows from sheet');
    const rows = yield Promise.promisify(sheet.getRows)({
      offset: 3
    });
    logger.info('Got all rows from sheet');

    const allMember = _.sortBy(rows.reduce((init, curr) => _.concat(init, {
      name: curr.name,
      surname: curr.surname,
      url: curr.link,
      role: curr.role,
      active: curr.active
    }), []), m => m.surname);

    return [
      _.filter(allMember, m => m.active === 'ja'),
      _.filter(allMember, m => m.active === 'nein')
    ];
  }).catch(ex => {
    throw ex;
  });

  let finalMembers;

  const cacheExists = yield fs.exists(cachePath);

  // Cache file does exist
  if (cacheExists && process.env.NODE_ENVIRONMENT === 'prod') {
    const fileStats = yield fs.stat(cachePath);

    // Cache file is outdated
    if ((new Date(fileStats.mtime).getDay()) != (new Date).getDay()) {
      logger.info('File', cachePath, 'is out of date, renewing');

      const member = yield fetchMemberList();

      yield fs.writeJson(cachePath, member);
      finalMembers = member;
    } else { // Cache file is up to date
      finalMembers = yield fs.readJson(cachePath);
    }
  } else { // Cache file does not exist
    const member = yield fetchMemberList();
    yield fs.writeJson(cachePath, member);
    finalMembers = member;
  }

  res.render('static/team/content', {
    layout: 'master',
    member: finalMembers,
    language: language
  });

}).catch(ex => {
  throw ex;
});
