'use strict';
/**
 * Created by Ardobras on 04.05.2016.
 */
const co = require('co');
const api = requireLocal('controller/api-proxy');

let admin = {};

admin.addPayment = (req, res, next) => co(function*() {
  //
}).catch((ex) => {
  next(ex);
});

admin.getInvoices = (req) => co(function*() {
  const events = yield api.getModel('event', req.user);

  let teams = yield events.map((e) => api.getModel(`event/${e.id}/team`, req.user));
  let allInvoices = yield teams.map((t) => api.getModel(`invoice/${t.invoiceId}`, req.user));

  /*
  //ADD CITY
  allInvoices = allInvoices.map((teams, index) => {
    return invites.map(invite => {
      invite.city = events[index].city;
      invite.event = events[index].id;
      return invite;
    });
  });

  allInvites = allInvites.map((invites, index) => {
    return invites.map(invite => {
      invite.city = events[index].city;
      invite.event = events[index].id;
      return invite;
    });
  });
  */
  return allInvoices;

}).catch((ex) => {
  throw ex;
});

module.exports = admin;
