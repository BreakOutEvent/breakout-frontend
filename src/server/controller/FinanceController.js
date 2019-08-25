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

admin.showDashboardPayment = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-payment';
  options.data = yield admin.getInvoices(req);
  options.data = options.data
    .filter(invoice => invoice.event.isCurrent)
    .sort(invoice => invoice.event.id)
    .reverse();
  res.render('static/finance/dashboard', options);
};

admin.showDashboardInvoice = function*(req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-invoice';
  if(req.query.eventId) {
    options.data = yield admin.getSponsoringInvoicesByEventId(req.user, req.query.eventId);
  }

  res.render('static/finance/dashboard', options);
};

admin.getInvoices = (req) => co(function*() {
  const events = yield api.getModel('event', req.user);

  let teamsByEvent = yield events
    .filter((e) => e.isCurrent)
    .map((e) => api.getModel(`event/${e.id}/team/teamfee`, req.user));

  let allTeams = _.flatten(teamsByEvent);
  return allTeams.map((x) => {
    let payed = x.invoice.payments.reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);

    return Object.assign({}, x.invoice, {
      event: events.find(event => event.id === x.team.event),
      members: x.team.members,
      teamName: x.team.name,
      id: x.team.invoiceId,
      teamId: x.team.id,
      open: x.invoice.amount - payed,
      datesFidorIds: x.invoice.payments.map((payment) => `${new Date(payment.date * 1000).toLocaleDateString()} (id: ${payment.fidorId})`).join(', ')
    });
  });
}).catch((ex) => {
  throw ex;
});

module.exports = admin;