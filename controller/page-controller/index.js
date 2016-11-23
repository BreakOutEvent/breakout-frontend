'use strict';

const execa = require('execa');
const a2h = require('ansi2html-extended');

let index = {};

index.showLogs = function *(req, res) {
  var cmd = 'npm run bunyan -s logs/' + req.params.log + '.log';

  const result = yield execa.shell(cmd);

  res.render('static/logs', {
    defaultLayout: false,
    content: a2h.fromString({
      standalone: false,
      escapeHtml: true
    }, result.stdout)
  });
};

module.exports = index;