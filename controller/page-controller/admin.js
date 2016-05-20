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
  sendErr(res, err.message, ex);
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

module.exports = admin;
