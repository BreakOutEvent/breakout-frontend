'use strict';
/**
 * Controller for the admin page.
 */

const co = require('co');
const _ = require('lodash');

const api = requireLocal('services/api-proxy');
const registration = requireLocal('controller/page-controller/registration');

let admin = {};

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

  res.status(500).send({ error: errMsg });
};

admin.addPayment = (req, res, next) => co(function*() {
  logger.info(`Trying to add payment for invoice ${req.body.invoice}`);

  let payment = yield api.postModel(
    `invoice/${req.body.invoice}/payment/`,
    req.user,
    { amount: req.body.amount }
  );

  if (!payment) return res.sendStatus(500);

  return res.sendStatus(200);
}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

admin.getInvoices = (req) => co(function*() {
  const events = yield api.getModel('event', req.user);

  let teamsByEvent = yield events.map((e) => api.getModel(`event/${e.id}/team`, req.user));
  let allTeams = _.flatten(teamsByEvent);

  let allInvoices = [];

  for (let i = 0; i < allTeams.length; i++) {
    let t = allTeams[i];
    if(t.members.length > 1) {
      let invoice = yield api.getModel(`invoice`, req.user, t.invoiceId);
      invoice.event = events[t.event -1].city;
      invoice.members = t.members;
      invoice.id = t.invoiceId;
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
}).catch((ex) => {
  throw ex;
});

admin.getAllTeams = (req) => co(function*() {

  const events = yield api.event.all();

  let teamsByEvent = yield events.map((e) => api.team.getAllByEvent(e.id));
  let allTeams = _.flatten(teamsByEvent);

  allTeams = allTeams.filter(t => t.hasFullyPaid);

  return allTeams.filter(t => t.hasFullyPaid);

}).catch((ex) => {
  throw ex;
});

admin.checkinTeam = (req, res, next) => co(function*() {

  let checkin = yield api.putModel(
    `event/${req.body.event}/team/`, req.body.team,
    req.user,
    { hasStarted: true }
  );

  if (!checkin) return res.sendStatus(500);

  return res.sendStatus(200);
}).catch((ex) => {
  sendErr(res, ex.message, ex);
});


admin.getAllInvoices = (req) => co(function*() {

  let rawInvoices =  yield api.invoice.getAll(req.user);

  var teams = [];



  var invoices = rawInvoices.map(i => {
    if (i.payments.length) {
      i.payed = i.payments.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);
      i.open = i.amount - i.payed;
      if (i.open < 0) i.open = 0;
    } else {
      i.payed = 0;
      i.open = i.amount;
    }
    return i;
  });


  invoices.forEach(i => {
    if(!teams[i.teamId]) teams[i.teamId] = 0;
    teams[i.teamId] += i.payed;
  });

  var depositTeams = teams.map((t, index) => {
    if(t > 100) {
      return {
        teamId: index,
        amount: t
      }
    }
  });

  return invoices;



}).catch((ex) => {
  throw ex;
});

admin.addAmountToInvoice = (req, res, next) => co(function*() {

  let addAmount = yield api.invoice.addAmount(req.user, req.body.invoiceId, req.body.amount);

  if (!addAmount) return res.sendStatus(500);

  return res.sendStatus(200);
}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

admin.addInvoice = (req, res, next) => co(function*() {

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

}).catch((ex) => {
  sendErr(res, ex.message, ex);
});

module.exports = admin;
