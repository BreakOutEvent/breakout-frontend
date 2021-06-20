'use strict';

const liveblog = require('./LiveblogController');
const registration = require('./RegistrationController');
const TeamController = require('./TeamController');
const _ = require('lodash');
const session = require('./SessionController');
const api = require('../services/api-proxy');

class DynamicController {

  static *showLiveBlog(req, res) {

    let token = null;
    if (req.isAuthenticated()) token = req.user;

    let isUserAdmin = false;

    if (req.user && req.user.me) {
      isUserAdmin = _.findIndex(req.user.me.roles, r => r === 'EVENT_MANAGER') > -1;
    }

    let events = yield liveblog.getEventInfos(req.session.activeEvents);
    req.session.activeEvents = events.activeEvents;
    req.session.save();

    let options = yield {
      activeEvents: events.activeEvents,
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      events: events,
      postings: liveblog.getAllPostings(events.activeEvents, token),
      mapData: liveblog.getMapData(events.activeEvents),
      isLoggedIn: req.user,
      isUserAdmin: isUserAdmin,
      title: 'Liveblog'
    };

    options.counter = yield liveblog.getCounterInfos(options.events.individual);

    res.render('dynamic/liveblog/liveblog', options);

  }

  static *showMap(req, res) {
    let events = yield liveblog.getEventInfos(req.session.activeEvents);

    let options = yield {
      layout: 'master',
      language: req.language,
      mapData: liveblog.getMapData(events.activeEvents),
      isLoggedIn: req.user,
      title: 'Liveblog'
    };

    options.counter = yield liveblog.getCounterInfos(events.individual);

    res.render('dynamic/liveblog/map', options);
  }

  static *showUserProfile(req, res) {

    let team = null;

    if (req.user.status.is.team) {
      team = yield api.getModel(`event/${req.user.me.participant.eventId}/team`, req.user, req.user.me.participant.teamId);
    }

    res.render('dynamic/profile/profile', {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      me: req.user.me,
      team: team,
      title: 'Profile'
    });

  }

  static *logout(req, res) {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect('/');
  }

  static *isLoggedIn(req, res) {
    res.send({
      isLoggedIn: req.isAuthenticated()
    });
  }

  static *showTransactionPurpose(req, res) {

    const purpose = yield registration.getTransactionPurpose(req);

    res.render('dynamic/register/payment', {
      error: req.flash('error'),
      layout: 'funnel',
      language: req.language,
      purpose: purpose
    });

  }

  static *showInvitesByToken(req, res) {
    let invite = yield registration.getInviteByToken(req.params.token);

    // TODO: This error handling is not correct! Invite is not null if backend returns an error json!
    if (!invite) {
      res.render('dynamic/register/register', {
        error: 'Invitecode is not valid.',
        layout: 'funnel',
        language: req.language
      });
    } else {
      res.render('dynamic/register/register', {
        error: req.flash('error'),
        layout: 'funnel',
        language: req.language,
        invite: invite
      });
    }
  }

  static *showInvites(req, res) {
    const teams = yield registration.getInvites(req);

    if (teams.length > 0) {
      res.render('dynamic/register/team-invite', {
        error: req.flash('error'),
        layout: 'funnel',
        language: req.language,
        amountInvites: teams.length,
        teams: teams
      });
    } else {
      res.redirect('/team-create');
    }
  }

  static *showHighscores(req, res) {

    if(!req.session.activeEvents) {
      req.session.activeEvents = [3,4,5];
    }

    let teamInfo = yield TeamController.getAll(req.session.activeEvents);
    let map = yield liveblog.getMapData(req.session.activeEvents);

    const requests = req.session.activeEvents.map(event => liveblog.getHighscores(event));
    const highscores = yield Promise.all(requests);
    let allTeams = [].concat.apply([], highscores);
    const disqualified = [598];
    allTeams = allTeams.filter(t => !disqualified.includes(t.teamId));
    let sortedTeamsbyScore = ( _.sortBy(allTeams, t => t.score)).reverse();
    let sortedTeamsbyDistance = ( _.sortBy(allTeams, t => t.distance)).reverse();
    let sortedTeamsbyMoney = (_.sortBy(allTeams, t => t.donatedSum.fullSum)).reverse();

    let slicedScore = sortedTeamsbyScore.slice(0, 10);
    let slicedDistance = sortedTeamsbyDistance.slice(0, 5);
    let slicedMoney = sortedTeamsbyMoney.slice(0, 5);

    res.render('dynamic/liveblog/highscore', {
      error: null,
      layout: 'master',
      language: req.language,
      mapData: map,
      eventsInfo: teamInfo.eventsInfo,
      teamScoreData: slicedScore,
      teamDistanceData: slicedDistance,
      teamMoneyData: slicedMoney,
      title: 'Highscore'
    });
  }

  static *activateAccount(req, res) {
    try {
      yield registration.activateUser(req.params.token);
      yield session.refreshSession(req);

      res.render('dynamic/register/activation', {
        error: null,
        layout: 'funnel',
        language: req.language
      });

    } catch (err) {
      res.render('dynamic/register/activation', {
        error: 'The token you provided is not valid (anymore).',
        layout: 'funnel',
        language: req.language
      });
    }
  }

  static *showCreateTeamPage(req, res, next) {

    const events = yield registration.getEvents(req);

    res.render('dynamic/register/team-create', {
      layout: 'funnel',
      language: req.language,
      events: events
    });
  }
}

module.exports = DynamicController;
