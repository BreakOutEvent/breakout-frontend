'use strict';

const liveblog = require('./liveblog');
const profile = require('./profile');
const registration = require('./registration');
const team = require('./team');
const _ = require('lodash');
const session = require('../session');

class DynamicController {

  static *showLiveBlog(req, res) {

    let token = null;
    if (req.isAuthenticated()) token = req.user;

    let isUserAdmin = false;

    if (req.user && req.user.me) {
      isUserAdmin = _.findIndex(req.user.me.roles, r => r === 'ADMIN') > -1;
    }

    let options = yield {
      error: req.flash('error'),
      layout: 'master',
      language: req.language,
      events: liveblog.getEventInfos(),
      postings: liveblog.getAllPostings(token),
      mapData: liveblog.getMapData(),
      isLoggedIn: req.user,
      isUserAdmin: isUserAdmin,
      title: 'Liveblog'
    };

    options.counter = yield liveblog.getCounterInfos(options.events.individual);

    res.render('dynamic/liveblog/liveblog', options);

  }

  static *showUserProfile(req, res) {

    let team = null;

    if (req.user.status.is.team) {
      team = yield profile.getTeam(req);
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
    res.redirect('/login');
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

  static *showHowToSponsor(req, res) {
    res.render('static/howtosponsor', {
      error: null,
      layout: 'master',
      language: req.language
    });
  }

  static *showHighscores(req, res) {

    let map = yield liveblog.getMapData();
    let allTeams = yield team.getAll();

    let sortedTeamsbyDistance = ( _.sortBy(allTeams, t => t.distance.distance)).reverse();

    let sortedTeamsbyMoney = (_.sortBy(allTeams, y => y.donateSum.fullSum)).reverse();

    let slicedDistance = sortedTeamsbyDistance.slice(0, 5);
    let slicedMoney = sortedTeamsbyMoney.slice(0, 5);


    res.render('dynamic/liveblog/highscore', {
      error: null,
      layout: 'master',
      language: req.language,
      mapData: map,
      teamDistanceData: slicedDistance,
      teamMoneyData: slicedMoney
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