'use strict';

/**
 * Routes for all sponsoring related requests
 */

const express = require('express');
const co = require('co');
const multer = require('multer');

const sponsoring = requireLocal('controller/page-controller/sponsoring');
const session = requireLocal('controller/session');

const upload = multer({ inMemory: true });
const router = express.Router();

router.get('/sponsoring', session.hasTeam, (req, res, next) => co(function*() {

  //CHECK IF USER IS SPONSOR OR PARTICIPANT
  if(!req.user.status.is.team && !req.user.status.is.sponsor) {
    req.flash(`error`, `Um diese Seite aufzurufen, musst Du entweder Teil eines Teams oder ein Sponsor sein.`);
    res.redirect('/selection');
  }

  //INCOMING
  const incSponsoring = yield sponsoring.getByTeam(req);

  //OUTGOING
  const outSponsoring = yield sponsoring.getBySponsor(req);


    res.render(`dynamic/sponsoring/sponsoring`,
      {
        error: req.flash('error'),
        layout: 'master',
        language: req.language,
        me: req.user.me,
        incSponsoring: incSponsoring,
        outSponsoring: outSponsoring,
        title: 'Sponsorings'
      });

}).catch(ex => next(ex)));


module.exports = router;