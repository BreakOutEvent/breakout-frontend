'use strict';

/**
 * Routes for all sponsoring related requests
 */

const express = require('express');
const co = require('co');
const multer = require('multer');

const sponsoring = requireLocal('controller/page-controller/sponsoring');
const session = requireLocal('controller/session');

const upload = multer({inMemory: true});
const router = express.Router();

//router.get('/sponsoring', session.isUser, (req, res, next) => co(function*() {
router.get('/sponsoring', (req, res, next) => co(function*() {


  //CHECK IF USER IS SPONSOR OR PARTICIPANT
  /* if (!req.user.status.is.team && !req.user.status.is.sponsor) {
    req.flash(`error`, `Um diese Seite aufzurufen, musst Du entweder Teil eines Teams oder ein Sponsor sein.`);
    return res.redirect('/selection');
  }*/

  let me = {
    firstname:"Henrike",
    lastname:"von Zimmermannn",
    gender:"male",
    participant: {
      teamId: 10,
      eventId: 1,
      teamName: "Awesome",
      eventCity: "München"
    },
    email: "test@test.de",
    sponsor: {
      id: 10
    }
  };

  req.user = {};
  req.user.me = me;

  //INCOMING
  const incSponsoring = yield sponsoring.getByTeam(req);

  ///console.log(incSponsoring);

  //OUTGOING
  const outSponsoring = yield sponsoring.getBySponsor(req);

  //const teams = yield sponsoring.getAllTeams(req);

  const teams = [{
    id: 1,
    name: "TEST",
    eventCity: "München"
  }];


  res.render(`dynamic/sponsoring/sponsoring`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      //me: me,
      me: req.user.me,
      incSponsoring: incSponsoring,
      outSponsoring: outSponsoring,
      teams:teams,
      title: 'Sponsorings'
    });

}).catch(ex => next(ex)));

//SPONSRING ROUTES

router.post('/sponsoring/create', session.hasTeam, upload.single('contract'), sponsoring.create);
router.put('/sponsoring/edit', session.isSponsor, upload.single('contract'), (req, res, next) => co(function*() {
  console.log(req.body);
  res.send(200);
}).catch(ex => next(ex)));


router.post('/sponsoring/accept', session.isUser, sponsoring.accept);
router.post('/sponsoring/reject', session.isUser, sponsoring.reject);
router.post('/sponsoring/delete', session.isUser, sponsoring.delete);

//CHALLENGE ROUTES
router.post('/challenge/create', upload.single('contract'), (req, res, next) => co(function*() {
  console.log(req.body);
  res.send(200);
}).catch(ex => next(ex)));

module.exports = router;