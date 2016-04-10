'use strict';

const Promise = require('bluebird');
const GoogleSpreadsheet = require('google-spreadsheet');
const co = require('co');
const _ = require('lodash');

const config = {
  doc_id: process.env.FRONTEND_GDRIVE_DOCUMENT_ID,
  client_email: process.env.FRONTEND_GDRIVE_CLIENT_EMAIL,
  private_key: process.env.FRONTEND_GDRIVE_PRIVATE_KEY
};

module.exports = (req, res) => {
  const doc = new GoogleSpreadsheet(config.doc_id);
  var credsJson = {
    client_email: config.client_email,
    private_key: config.private_key.replace(/\\n/g, '\n')
  };

  co(function*() {
    yield Promise.promisify(doc.useServiceAccountAuth)(credsJson);

    const info = yield Promise.promisify(doc.getInfo)();
    const sheet = info.worksheets[0];

    const rows = yield Promise.promisify(sheet.getRows)({
      offset: 3,
      orderby: 'name'
    });

    const vars = rows.reduce((init, curr) => _.concat(init, {
      name: curr.name,
      surname: curr.surname,
      url: curr.link,
      role: curr.role
    }), []);

    res.render('static/team/content', {
      layout: 'master',
      member: vars,
      language: req.params.language
    });

  }).catch(ex => console.error(ex.stack));
};
