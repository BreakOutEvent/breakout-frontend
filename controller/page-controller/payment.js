'use strict';

const api = requireLocal('controller/api-proxy');
const co = require('co');

let payment = {};

payment.getToken = (req, res) =>  co(function*() {

  const me = yield api.getCurrentUser(req.user);

  //TODO get invoices

  const invoiceID = '';

  const token = yield api.getPaymentToken(invoiceID, req.user);

  if (token) {
    res.send({ token });
  } else {
    res.status(500).send({ error: 'Could not get Token from Backend' });
  }

}).catch(ex => {
  throw ex;
});

payment.checkout = (req, res) =>  co(function*() {

  console.log(req.body);

  //const token = yield api.checkoutPayment();

  if (token) {
    res.send({ token });
  } else {
    res.status(500).send({ error: 'Could not get Token from Backend' });
  }

}).catch(ex => {
  throw ex;
});

module.exports = payment;

