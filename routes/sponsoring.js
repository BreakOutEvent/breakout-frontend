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

router.get('/sponsoring', session.isUser, (req, res, next) => co(function*() {
//router.get('/sponsoring', (req, res, next) => co(function*() {


  //CHECK IF USER IS SPONSOR OR PARTICIPANT
   if (!req.user.status.is.team && !req.user.status.is.sponsor) {
    req.flash(`error`, `Um diese Seite aufzurufen, musst Du entweder Teil eines Teams oder ein Sponsor sein.`);
    return res.redirect('/selection');
  }
/*
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
  req.user.me = me;*/
  let incSponsoring = [];
  let incChallenges = [];
  let outSponsoring = [];
  let outChallenges = [];
  //INCOMING
  if(req.user.status.is.participant) {
    incSponsoring = yield sponsoring.getByTeam(req);
    incChallenges = yield sponsoring.challenge.getByTeam(req);
  }


  ///console.log(incSponsoring);

  //OUTGOING
  if(req.user.status.is.sponsor) {
    outSponsoring = yield sponsoring.getBySponsor(req);
    //outChallenges = yield sponsoring.challenge.getBySponsor(req);
  }


  const teams = yield sponsoring.getAllTeams(req);

  /*const teams = [{
    id: 1,
    name: "TEST",
    eventCity: "München",
    event: 1
  }];*/

  console.log(outSponsoring);

  res.render(`dynamic/sponsoring/sponsoring`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      incSponsoring: incSponsoring,
      incChallenges: incChallenges,
      outSponsoring: outSponsoring,
      outChallenges: outChallenges,
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
//TODO wait for backend
//router.post('/sponsoring/delete', session.isUser, sponsoring.delete);

//CHALLENGE ROUTES
router.post('/challenge/create', session.isUser, upload.single('contract'), sponsoring.challenge.create);
router.post('/challenge/accept', session.isUser, sponsoring.challenge.accept);
router.post('/challenge/reject', session.isUser, sponsoring.challenge.reject);
//TODO wait for backend
//router.post('/challenge/delete', session.isUser, sponsoring.challenge.delete);

module.exports = router;