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


  //CHECK IF USER IS SPONSOR OR PARTICIPANT
   if (!req.user.status.is.team && !req.user.status.is.sponsor) {
    req.flash(`error`, `Um diese Seite aufzurufen, musst Du entweder Teil eines Teams oder ein Sponsor sein.`);
    return res.redirect('/selection');
  }

  let incSponsoring = [];
  let incChallenges = [];
  let outSponsoring = [];
  let outChallenges = [];
  //INCOMING
  if(req.user.status.is.team) {
    incSponsoring = yield sponsoring.getByTeam(req);
    incChallenges = yield sponsoring.challenge.getByTeam(req);
  }
  
  //OUTGOING
  if(req.user.status.is.sponsor) {
    outSponsoring = yield sponsoring.getBySponsor(req);
    outChallenges = yield sponsoring.challenge.getBySponsor(req);
  }


  const teams = yield sponsoring.getAllTeams(req);

  res.render(`dynamic/sponsoring/sponsoring`,
    {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      status: req.user.status,
      incSponsoring: incSponsoring,
      incChallenges: incChallenges,
      outSponsoring: outSponsoring,
      outChallenges: outChallenges,
      teams:teams,
      title: 'Sponsorings'
    });

}).catch(ex => next(ex)));

//SPONSRING ROUTES

router.post('/sponsoring/create', session.isUser, upload.single('contract'), sponsoring.create);
router.post('/sponsoring/accept', session.isUser, sponsoring.accept);
router.post('/sponsoring/reject', session.isUser, sponsoring.reject);
router.post('/sponsoring/delete', session.isUser, sponsoring.delete);

//CHALLENGE ROUTES
router.post('/challenge/create', session.isUser, upload.single('contract'), sponsoring.challenge.create);
router.post('/challenge/accept', session.isUser, sponsoring.challenge.accept);
router.post('/challenge/reject', session.isUser, sponsoring.challenge.reject);
router.post('/challenge/delete', session.isUser, sponsoring.challenge.delete);

module.exports = router;