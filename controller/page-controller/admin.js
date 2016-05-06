'use strict';
/**
 * Created by Ardobras on 04.05.2016.
 */
const co = require('co');
const api = requireLocal('controller/api-proxy');
const registration = requireLocal('controller/page-controller/registration');
const _ = require('lodash');

let admin = {};

const sendErr = (res, errMsg, err) => {

  if (err) logger.error(errMsg, err);
  else logger.error(errMsg);

  return res.status(500).send({ error: errMsg });
};

admin.addPayment = (req, res, next) => co(function*() {
  logger.info(`Trying to add payment for invoice ${req.body.invoice}`);
  let payment = yield api.postModel(`invoice/${req.body.invoice}/payment/`, req.user, {amount:req.body.amount});
  if(!payment) return res.sendStatus(500);
  return res.sendStatus(200);
}).catch((ex) => {
  sendErr(res, err.message, ex);
});

admin.getInvoices = (req) => co(function*() {
  const events = yield api.getModel('event', req.user);

  let teamsByEvent = yield events.map((e) => api.getModel(`event/${e.id}/team`, req.user));
  let allTeams = _.flatten(teamsByEvent);

  let allInvoices = [];

  for(let i = 0; i < allTeams.length; i++) {
    let t = allTeams[i];
    if(t.members.length > 1){
      let invoice = yield api.getModel(`invoice/${t.invoiceId}`, req.user);
      invoice.event = events[t.event -1].city;
      invoice.members = t.members;
      invoice.id = t.invoiceId;
      if(invoice.payments.length) {
        invoice.open = invoice.amount - invoice.payments.reduce((prev, curr) => {return prev.amount + curr.amount});
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
