'use strict';
/**
 * Controller for the admin page.
 */

const co = require('co');
const _ = require('lodash');
const api = require('../../services/api-proxy');
const Promise = require('bluebird');
const logger = require('../../services/logger');
const config = require('../../config/config');
const axios = require('axios');

let admin = {};

const defaultOptions = (req) => {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    isLoggedIn: req.user,
    language: req.language
  };
};

admin.showDashboard = (req, res) => {
  let options = defaultOptions(req);
  options.view = 'admin-dashboard';
  options.data = {};
  res.render('static/admin/dashboard', options);
};

admin.showDashboardEmails = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-emails';
  let emailAddress = req.query.emailAddress;

  if(emailAddress) {
    options.data = {};
    const emails = yield admin.getAllEmailsTo(emailAddress);

    // Date in JS is in ms but api response is in s
    options.data.emails = emails.map(email => {
      email.create_date = email.create_date * 1000;
      return email;
    });
  }

  res.render('static/admin/dashboard', options);
};

admin.showDashboardPayment = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-payment';
  options.data = yield admin.getInvoices(req.user);
  options.data = options.data
    .filter(invoice => invoice.event.isCurrent)
    .sort(invoice => invoice.event.id)
    .reverse();
  res.render('static/admin/dashboard', options);
};

admin.showDashboardCheckin = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-checkin';
  options.data = yield admin.getAllTeams(req);
  res.render('static/admin/dashboard', options);
};

admin.showOverview = function*(req, res) {

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

  let defaultValue;
  if(req.query.direction) {
    if(req.query.direction === 'up') {
      defaultValue = Number.MAX_VALUE;
    } else if (req.query.direction === 'down') {
      defaultValue = 0;
    } else {
      throw new Error('invalid sort criteria '+req.query.direction);
    }
  } else {
    defaultValue = 0;
    req.query.direction = 'up';
  }

  options.data = options.data.map(function(team){
    team.lastContact = {};

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
    }
    else{
      team.lastContact.timestamp = defaultValue;
    }

    if(!team.lastContactWithHeadquarters) {
      team.lastContactWithHeadquarters = {};
      team.lastContactWithHeadquarters.timestamp = defaultValue;
    }

    if(!team.lastPosting) {
      team.lastPosting = {};
      team.lastPosting.timestamp = defaultValue;
    }

    if(!team.lastLocation) {
      team.lastLocation = {};
      team.lastLocation.timestamp = defaultValue;
    }

    return team;
  });

  if(req.query.sortBy){
    options.data = options.data.sort(compare);
  }

  res.render('static/admin/dashboard', options);
};

function getAccessTokenFromRequest(req) {
  return req.user.access_token;
}

admin.showDashboardInvoice = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-invoice';
  if(req.query.eventId) {
    options.data = yield admin.getSponsoringInvoicesByEventId(req.user, req.query.eventId);
  }

  res.render('static/admin/dashboard', options);
};

admin.getSponsoringInvoicesByEventId = function(tokens, eventId) {
  return api.getModel(`/sponsoringinvoice/${eventId}/`, tokens);
};

admin.addPayment = function *(req, res) {
  logger.info(`Trying to add payment for invoice ${req.body.invoice}`);

  let body = {
    amount: req.body.amount,
    fidorId: req.body.fidorId
  };

  try {
    yield api.postModel(`invoice/${req.body.invoice}/payment/`, req.user, body);
    res.sendStatus(200);
  } catch (err) {
    res.status(500);
    logger.error(`An error occured while trying to add a payment to invoice ${req.body.invoice}: `, err);
    if (err.message) {
      res.json({message: err.message});
    } else {
      res.json({message: 'An unknown error occured'});
    }

  }
};

admin.updateLastContact = function *(req, res) {


  try {
    let comment = yield api.postModel(`/teamoverview/${req.body.teamid}/lastContactWithHeadquarters/`, req.user, {comment: req.body.update});
    res.redirect('/admin/teamoverview/');
  } catch (err) {
    res.status(500);
    logger.error(`An error occured while trying to update the last contact ${req.body.update}: `, err);
    if (err.message) {
      res.json({message: err.message});
    } else {
      res.json({message: 'An unknown error occured'});
    }

  }
};

admin.getAllEmailsTo = function(emailAddress) {
  return axios.get(`https://mail.break-out.org/get/to/${emailAddress}`, {
    headers: {
      'X-AUTH-TOKEN': config.mailer.x_auth_token
    }
  }).then(resp => resp.data);
};

admin.getInvoices = getInvoices;

async function getInvoices(tokens) {
  const events = await api.getModel('event', tokens);

  let teamsByEvent = await Promise.all(events.map((e) => api.getModel(`event/${e.id}/team`, tokens)));
  let allTeams = _.flatten(teamsByEvent);

  let allInvoices = [];

  for (let i = 0; i < allTeams.length; i++) {
    let t = allTeams[i];
    if (t.members.length > 1) {
      let invoice = await api.getModel('invoice/teamfee', tokens, t.invoiceId);
      invoice.event = events[t.event - 1];
      invoice.members = t.members;
      invoice.teamName = t.name;
      invoice.id = t.invoiceId;
      invoice.teamId = t.id;
      if (invoice.payments.length) {
        invoice.open = invoice.amount - invoice.payments.reduce((prev, curr) => {
          return prev + curr.amount;
        }, 0);
      } else {
        invoice.open = invoice.amount;
      }
      allInvoices.push(invoice);
    }
  }

  return allInvoices;
}

admin.getAllTeams = function () {
  return Promise.resolve(api.event.all())
    .map(event => api.team.getAllByEvent(event.id))
    .reduce((a, b) => a.concat(b), [])
    .filter(team => team.hasFullyPaid);
};

admin.checkinTeam = function *(req, res) {

  let checkin = yield api.putModel(
    `event/${req.body.event}/team/`, req.body.team,
    req.user,
    {hasStarted: true}
  );

  if (!checkin) return res.sendStatus(500);

  return res.sendStatus(200);
};

admin.addAmountToInvoice = function *(req, res) {

  let addAmount = yield api.invoice.addAmount(req.user, req.body.invoiceId, req.body.amount);

  if (!addAmount) return res.sendStatus(500);

  return res.sendStatus(200);
};

admin.addInvoice = function *(req, res) {

  var body = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    company: req.body.company,
    teamId: parseFloat(req.body.teamId),
    amount: parseFloat(req.body.amount)
  };

  let addAmount = yield api.invoice.create(req.user, body);

  if (!addAmount) return res.sendStatus(500);

  return res.status(200).send(addAmount);

};


module.exports = admin;
