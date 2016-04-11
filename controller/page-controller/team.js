'use strict';

const Promise = require('bluebird');
const GoogleSpreadsheet = require('google-spreadsheet');
const co = require('co');
const _ = require('lodash');
const fs = require('co-fs-extra');

const config = {
  doc_id: process.env.FRONTEND_GDRIVE_DOCUMENT_ID,
  client_email: process.env.FRONTEND_GDRIVE_CLIENT_EMAIL,
  private_key: process.env.FRONTEND_GDRIVE_PRIVATE_KEY
};

module.exports = (req, res) => {
  co(function*() {
    const cachePath = ROOT + '/rendered/cache/teams.json.cache';

    const fetchMemberList = () => co(function*() {
      const doc = new GoogleSpreadsheet(config.doc_id);
      var credsJson = {
        client_email: config.client_email,
        private_key: config.private_key.replace(/\\n/g, '\n')
      };

      yield Promise.promisify(doc.useServiceAccountAuth)(credsJson);

      const info = yield Promise.promisify(doc.getInfo)();
      const sheet = info.worksheets[0];

      const rows = yield Promise.promisify(sheet.getRows)({
        offset: 3
      });

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
    if (cacheExists && process.env.NODE_ENV === 'production') {
      const fileStats = yield fs.stat(cachePath);

      // Cache file is outdated
      if ((new Date(fileStats.mtime).getDay()) != (new Date).getDay()) {
        console.log('File ' + cachePath + ' is out of date, renewing');

        const member = yield fetchMemberList();
        yield fs.writeJson(cachePath, member);
        finalMembers = member;
      } else { // Cache file is up to date
        console.log('File ' + cachePath + ' is up to date');
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
      language: req.params.language
    });

  }).catch(ex => console.error(ex.stack));
};
