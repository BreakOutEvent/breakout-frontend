'use strict';

const co = require('co');
const _ = require('lodash');
const logger = require('../services/logger');

const api = require('../services/api-proxy');

const sponsoring = {};

/**
 * Sends the occurred error back to the client, and logs it to the bunyan global logger.
 * @param res
 * @param errMsg
 * @param err
 * @returns {*}
 */
const sendErr = (res, errMsg, err) => {

  if (err) logger.error(errMsg, err);
  else logger.error(errMsg);

  res.status(500).send({error: errMsg});
};

/**
 * Parses input to fit the backend
 * @param rawAmount
 * @returns {*}
 */

const parseAmount = (rawAmount) => {
  let rawAmountString = String(rawAmount);

  let amountArray = rawAmountString.match(/(\d+)[\.|,]?(\d*)/);
  if (amountArray.length === 3) {
    return amountArray[1] + '.' + amountArray[2];
  } else if (amountArray[2] === '') {
    return amountArray[1];
  } else {
    throw 'could not parse amount';
  }
};

sponsoring.showSponsorings = function*(req, res) {
  //CHECK IF USER IS SPONSOR OR PARTICIPANT
  if (!req.user.status.is.team && !req.user.status.is.sponsor) {
    req.flash('error', 'Um diese Seite aufzurufen, musst Du entweder Teil eines Teams oder ein Sponsor sein.');
    return res.redirect('/sponsor');
  }

  let incSponsoring = [];
  let incChallenges = [];
  let outSponsoring = [];
  let outChallenges = [];
  let confirmedDonations = [];
  let teams = [];
  let confirmedInvoices = [];

  //INCOMING
  if (req.user.status.is.team) {
    incSponsoring = yield sponsoring.getByTeam(req);
    incChallenges = yield sponsoring.challenge.getByTeam(req);
    confirmedDonations = yield sponsoring.invoice.getByTeam(req);

    req.user.me.participant.event = yield api.event.get(req.user.me.participant.eventId);
  }

  //OUTGOING
  if (req.user.status.is.sponsor) {
    outSponsoring = yield sponsoring.getBySponsor(req);
    outChallenges = yield sponsoring.challenge.getBySponsor(req);
    confirmedInvoices = yield sponsoring.invoice.getBySponsor(req);
    teams = yield sponsoring.getAllTeamsSummary(req);
    teams = teams.filter(team => team.eventAllowNewSponsoring);
  }

  res.render('dynamic/sponsoring/sponsoring', {
    error: req.flash('error'),
    layout: 'master',
    language: req.language,
    me: req.user.me,
    status: req.user.status,
    incSponsoring: incSponsoring,
    incChallenges: incChallenges,
    outSponsoring: outSponsoring,
    outChallenges: outChallenges,
    confirmedDonations: confirmedDonations,
    confirmedInvoices: confirmedInvoices,
    hasSupporterType: (req.user.me.sponsor && req.user.me.sponsor.supporterType),
    teams: teams,
    isLoggedIn: req.user,
    title: 'Sponsorings',
    fromTeam: req.query.id,
    mode: req.query.mode
  });

};

/**
 * Creates a sponsoring.
 * @param req
 * @param res
 * @param next
 */

sponsoring.create = (req, res, next) => co(function*() {

  let body = {};
  
  try {
     // convert single team into single item array.
     const teamJsonObjects = Array.isArray(req.body.team) ? req.body.team : [req.body.team];
     // parse stringified JSON into objects of {team, event}
     const teamObjects = teamJsonObjects.map(x => JSON.parse(x));
     // only select team IDs
     body.teams = teamObjects.map(x => x.team);
     body.event = teamObjects[0].event
  } catch (ex) {
    return sendErr(res, ex.message, ex);
  }
  
  try {
    body.amountPerKm = parseAmount(req.body.amountPerKm_text);
    if (req.body.limit) body.limit = parseAmount(req.body.limit);
    //TODO add proper limit (BACKEND HACK)
    else body.limit = 1000000000;
  } catch(ex) {
    return sendErr(res, 'Invalid Amount', ex);
  }

  //OFFLINE PART
  if (req.body.street) {
    body.unregisteredSponsor = {};
    body.unregisteredSponsor.address = {
      street: req.body.street,
      housenumber: req.body.housenumber,
      zipcode: req.body.zipcode,
      city: req.body.city,
      country: req.body.country
    };
    body.unregisteredSponsor.firstname = req.body.firstname;
    body.unregisteredSponsor.lastname = req.body.lastname;
    body.unregisteredSponsor.company = req.body.company;
    body.unregisteredSponsor.gender = req.body.gender;
    body.unregisteredSponsor.email = req.body.email;

    if (!req.body.url) body.unregisteredSponsor.url = '';
    else body.unregisteredSponsor.url = req.body.url;

    if (req.body.selfChallengeDescription) {
      if (req.body.selfChallengeDescription.length !== req.body.selfChallengeAmount.length) {
        return sendErr(res, 'Unequal amount of challenge descriptions and challenge amounts');
      }

      body.challenges = yield req.body.selfChallengeDescription.map(
        (e, i) => {
          if (e.length > 0) {
            let currBody = {
              amount: parseAmount(req.body.selfChallengeAmount[i]),
              description: e,
              unregisteredSponsor: body.unregisteredSponsor
            };
            if (parseFloat(currBody.amount) > 0) {
              return api.challenge.create(req.user, body.event, currBody);
            }
          }
          return null;
        });

      for (var i = 0; i < body.challenges.length; i++) {
        if (body.challenges[i] && req.file) {
          // TODO: Update this / remove all this code with new sponsoring logic
          yield api.uploadFile(req.file, body.challenges[i].contract);
        }
      }

    }

  }

  let sponsoring = null;

  if (parseFloat(body.amountPerKm) > 0) {
    sponsoring = yield api.sponsoring.create(req.user, body.event, body);
    if (req.file) {
      // TODO: Update this / remove all this code with new sponsoring logic
      yield api.uploadFile(req.file, sponsoring.contract);
    }
  } else if (!req.body.selfChallengeDescription) {
    return sendErr(res, 'Missing amountPerKm and challanges, at least one variable has to be present');
  }

  res.send(sponsoring);

}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.getAllTeams = (req) => co(function*() {
  const events = yield api.event.all();

  let teamsByEvent = yield events.map((e) => api.getModel(`event/${e.id}/team`, req.user));

  let allTeams = teamsByEvent.map((teams, index) => {
    return teams.map(team => {
      team.city = events[index].city;
      team.event = events[index].id;
      return team;
    });
  });

  allTeams = _.flatten(allTeams);
  allTeams = allTeams.filter(t => t.hasFullyPaid);
  return _.sortBy(allTeams, t => t.name);

}).catch(ex => {
  throw ex;
});

sponsoring.getAllTeamsSummary = (req) => co(function*() {
  let teams = yield api.getModel('team', req.user);
  return _.sortBy(teams, t => t.name);
}).catch(err => {
  throw err;
});

sponsoring.getByTeam = (req) => co(function*() {

  let allSponsorings = yield api.sponsoring.getByTeam(
    req.user.me.participant.eventId,
    req.user.me.participant.teamId,
    req.user.access_token);

  let callSponsorings = allSponsorings.filter(c => !!c.userId);

  let sponsors = yield callSponsorings.map(s => api.user.get(s.userId));

  return allSponsorings.map(sponsoring => {
    sponsoring.sponsor = sponsors.filter(s => s.id == sponsoring.userId)[0];
    return sponsoring;
  });


}).catch(ex => {
  throw ex;
});

sponsoring.getBySponsor = (req) => co(function*() {

  return yield api.sponsoring.getBySponsor(
    req.user,
    req.user.me.id);

}).catch(ex => {
  throw ex;
});

sponsoring.accept = (req, res, next) => co(function*() {

  yield api.sponsoring.accept(req.user, req.body.eventId, req.body.teamId, req.body.sponsoringId);

  return res.sendStatus(200);
}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.reject = (req, res, next) => co(function*() {

  yield api.sponsoring.reject(req.user, req.body.eventId, req.body.teamId, req.body.sponsoringId);

  return res.sendStatus(200);
}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.delete = (req, res, next) => co(function*() {

  yield api.sponsoring.delete(req.user, req.body.eventId, req.body.teamId, req.body.sponsoringId);

  return res.sendStatus(200);

}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.challenge = {};

sponsoring.challenge.create = (req, res, next) => co(function*() {

  let body = {};

  try {
       // convert single team into single item array.
       const teamJsonObjects = Array.isArray(req.body.addChallengeTeam) ? req.body.addChallengeTeam : [req.body.addChallengeTeam];
       // parse stringified JSON into objects of {team, event}
       const teamObjects = teamJsonObjects.map(x => JSON.parse(x));
       // only select team IDs
       body.teams = teamObjects.map(x => x.team);
       body.event = teamObjects[0].event
  } catch (ex) {
    return sendErr(res, ex.message, ex);
  }

  if (req.body.addChallengeDescription.length !== req.body.addChallengeAmount.length) {
    return sendErr(res, 'Unequal amount of challenge descriptions and challenge amounts');
  }

  let test = yield req.body.addChallengeDescription.map(
    (e, i) => {
      let currBody = {
        ...body,
        amount: parseAmount(req.body.addChallengeAmount[i]),
        maximumCount: req.body.addChallengeMaximumCount[i],
        description: e
      };
      return api.challenge.create(req.user, body.event, currBody);
    });

  res.sendStatus(200);

}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.challenge.getByTeam = (req) => co(function*() {

  let allChallenges = yield api.challenge.getByTeam(
    req.user.me.participant.eventId,
    req.user.me.participant.teamId,
    req.user.access_token);

  let callChallenges = allChallenges.filter(c => !!c.userId);

  let sponsors = yield callChallenges.map(c => api.user.get(c.userId));

  return allChallenges.map(challenge => {
    challenge.sponsor = sponsors.filter(s => s.id == challenge.userId)[0];
    return challenge;
  });

}).catch(ex => {
  throw ex;
});

sponsoring.challenge.getBySponsor = (req) => co(function*() {

  return yield api.challenge.getBySponsor(
    req.user,
    req.user.me.id);

}).catch(ex => {
  throw ex;
});

sponsoring.challenge.reject = (req, res, next) => co(function*() {

  yield api.challenge.reject(req.user, req.body.eventId, req.body.teamId, req.body.challengeId);

  return res.sendStatus(200);
}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.challenge.delete = (req, res, next) => co(function*() {

  yield api.challenge.delete(req.user, req.body.eventId, req.body.teamId, req.body.challengeId);

  return res.sendStatus(200);
}).catch(ex => {
  sendErr(res, ex.message, ex);
});

sponsoring.invoice = {};

sponsoring.invoice.getByTeam = (req) => co(function*() {

  let rawInvoices = yield api.invoice.getByTeam(req.user, req.user.me.participant.teamId);

  let invoices = rawInvoices.map(i => {
    return Object.assign({}, i, {
      hasFullyPaid: i.payed + 0.005 >= i.amount
    });
  });

  let confirmedDonations = {};
  confirmedDonations.invoices = invoices;
  confirmedDonations.totalSum = invoices.reduce((curr, next) => {
    return curr + next.payed;
  }, 0);

  confirmedDonations.totalCount = invoices.filter(i => i.payed > 0).length;

  return confirmedDonations;

}).catch(ex => {
  throw ex;
});

sponsoring.invoice.getBySponsor = (req) => co(function*() {
  let rawInvoices = yield api.invoice.getBySponsor(req.user);

  return rawInvoices.map(i => {
    return Object.assign({}, i, {
      challenges: i.challenges.filter((c) => c.billableAmount > 0),
      sponsorings: i.sponsorings.filter((s) => s.billableAmount > 0),
      hasFullyPaid: i.payed + 0.005 >= i.amount,
      includesTax: i.type != 'DONOR'
    });
  });
}).catch(ex => {
  throw ex;
});

sponsoring.sponsoringIsOpenForAnyEvent = (req, res, next) => co(function *(){
  const events = yield api.event.all();
  if (events.some(event => event.allowNewSponsoring)) {
    next();
  } else {
    res.redirect('/sponsor-closed');
  }
});

module.exports = sponsoring;
