/**
 * Created by Ardobras on 04.05.2016.
 */
const co = require('co');
const api = requireLocal('controller/api-proxy');


let admin = {};

admin.addPayment = (req, res, next) => co(function*() {
  //
});

admin.getInvoices = (req, res, next) => co(function*() {
  //
});

module.exports = admin;