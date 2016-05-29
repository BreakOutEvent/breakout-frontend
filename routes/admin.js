'use strict';

/**
 * Routes for the admin dashboard.
 */

const co = require('co');
const express = require('express');

const session = requireLocal('controller/session');
const admin = requireLocal('controller/page-controller/admin');

const router = express.Router();

const resDefault = (req) => {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    isLoggedIn: req.isAuthenticated(),
    language: req.language
  };
};

//VIEWS
router.get('/', session.isAdmin, (req, res) => {
  let options = resDefault(req);
  options.view = 'admin-dashboard';
  options.data = {};
  res.render(`static/admin/dashboard`, options);
});

router.get('/emails', session.isAdmin, (req, res) => {
  let options = resDefault(req);
  options.view = 'admin-emails';
  options.data = {};
  res.render(`static/admin/dashboard`, options);
});

router.get('/payment', session.isAdmin, (req, res, next) => co(function*() {
  let options = resDefault(req);
  options.view = 'admin-payment';
  options.data = yield admin.getInvoices(req);
  res.render(`static/admin/dashboard`, options);
}).catch((ex) => {
  console.log(ex);
  next(ex);
}));

router.post('/payment/add', session.isAdmin, admin.addPayment);

module.exports = router;
