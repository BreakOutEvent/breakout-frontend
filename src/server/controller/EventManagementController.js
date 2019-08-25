'use strict';
/**
 * Controller for the admin page.
 */

const co = require('co');
const _ = require('lodash');
const api = require('../services/api-proxy');
const Promise = require('bluebird');
const logger = require('../services/logger');
const config = require('../config/config');
const axios = require('axios');

let admin = {};

let callReasons = [
  'Technical Problem',
  '5h Update',
  'New Transport',
  'Finished BreakOut',
  'Sickness',
  'Emergency',
  'Other'
];

const defaultOptions = (req) => {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    isLoggedIn: req.user,
    language: req.language
  };
};

admin.showDashboardCheckin = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-checkin';
  options.data = yield admin.getAllCurrentTeams(req);
  res.render('static/event/dashboard', options);
};

admin.showAllChallenges = function* (req, res) {
  let options = defaultOptions(req);

  options.view = 'admin-allchallenges';
  options.data = yield api.getAllChallenges(getAccessTokenFromRequest(req)).then(resp => resp.data);
  options.data = options.data.filter(challenge => challenge.status === 'PROPOSED');
  options.data.sort((a, b) => b.amount - a.amount);

  res.render('static/event/dashboard', options);
};

admin.showOverview = function*(req, res) {

  if (!req.query.sortBy) {
    req.query.sortBy = 'lastContact';
    req.query.direction = 'up';
  }

  function compare(a,b) {
    if(a[req.query.sortBy]){
      if(req.query.direction === 'up'){
        if (a[req.query.sortBy].timestamp< b[req.query.sortBy].timestamp)
          return -1;
        if (a[req.query.sortBy].timestamp > b[req.query.sortBy].timestamp)
          return 1;
        return 0;
      }
      else if(req.query.direction === 'down'){
        if (a[req.query.sortBy].timestamp> b[req.query.sortBy].timestamp)
          return -1;
        if (a[req.query.sortBy].timestamp < b[req.query.sortBy].timestamp)
          return 1;
        return 0;
      }
    }
  }

  let options = defaultOptions(req);
  options.view = 'admin-teamoverview';                 // TODO: .then should be moved to api layer
  options.data = yield api.getTeamOverview(getAccessTokenFromRequest(req)).then(resp => resp.data);

  options.data = options.data.map(function(team){
    team.lastContact = {};
    team.callReasons = callReasons;

    let validInfo = [team.lastContactWithHeadquarters, team.lastPosting, team.lastLocation].filter(function(elem){
      return elem;
    });

    let validTimestamps = validInfo.map(function(info){
      return info.timestamp;
    }).filter(function(elem){
      return elem;
    });

    if(validTimestamps.length != 0){
      team.lastContact.timestamp = Math.max.apply(Math, validTimestamps);
    } else {
      team.lastContact.timestamp = null;
    }

    if(!team.lastContactWithHeadquarters) {
      team.lastContactWithHeadquarters = {};
      team.lastContactWithHeadquarters.timestamp = null;
    }

    if(!team.lastPosting) {
      team.lastPosting = {};
      team.lastPosting.timestamp = null;
    }

    if(!team.lastLocation) {
      team.lastLocation = {};
      team.lastLocation.timestamp = null;
    }

    return team;
  });

  if(req.query.sortBy){
    options.data = options.data.sort(compare);
  }

  res.render('static/event/dashboard', options);
};

admin.showCallsForTeam = function*(req, res) {
  let options = defaultOptions(req);
  const teamId = req.query.teamId;
  const team = yield api.team.get(teamId);
  const calls = yield api.getCallsForTeam(getAccessTokenFromRequest(req), teamId).then(resp => resp.data);
  options.team = team;
  options.calls = calls.map((call) => Object.assign({}, call, { callReasons }));
  res.render('static/event/calls', options);
};

function getAccessTokenFromRequest(req) {
  return req.user.access_token;
}

admin.getAllCurrentTeams = function () {
  return Promise.resolve(api.event.all())
    .filter(event => event.isCurrent)
    .map(event => api.team.getAllByEvent(event.id))
    .reduce((a, b) => a.concat(b), [])
    .filter(team => team.hasFullyPaid);
};

module.exports = admin;
