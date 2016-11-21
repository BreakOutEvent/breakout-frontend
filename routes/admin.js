'use strict';

/**
 * Routes for the admin dashboard.
 */
const session = requireLocal('controller/session');
const admin = requireLocal('controller/page-controller/admin');

const Router = require('co-router');
const router = new Router();

const defaultOptions = (req) => {
  return {
    error: req.flash('error'),
    success: req.flash('success'),
    layout: 'master',
    isLoggedIn: req.user,
    language: req.language
  };
};

//VIEWS
router.get('/', session.isAdmin, (req, res) => {
  let options = defaultOptions(req);
  options.view = 'admin-dashboard';
  options.data = {};
  res.render('static/admin/dashboard', options);
});

router.get('/emails', session.isAdmin, (req, res) => {
  let options = defaultOptions(req);
  options.view = 'admin-emails';
  options.data = {};
  res.render('static/admin/dashboard', options);
});

router.get('/payment', session.isAdmin, function* (req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-payment';
  options.data = yield admin.getInvoices(req);
  res.render('static/admin/dashboard', options);
});

router.get('/checkin', session.isAdmin, function* (req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-checkin';
  options.data = yield admin.getAllTeams(req);
  res.render('static/admin/dashboard', options);
});

router.get('/invoice', session.isAdmin, function* (req, res) {
  let options = defaultOptions(req);
  options.view = 'admin-invoice';
  options.data = yield admin.getAllInvoices(req);
  res.render('static/admin/dashboard', options);
});

router.post('/payment/add', session.isAdmin, admin.addPayment);
router.post('/invoice/amount/add', session.isAdmin, admin.addAmountToInvoice);
router.post('/invoice/add', session.isAdmin, admin.addInvoice);
router.post('/team/checkin', session.isAdmin, admin.checkinTeam);

module.exports = router;
