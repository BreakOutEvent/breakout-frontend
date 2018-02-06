'use strict';

/**
 * Routes for the admin dashboard.
 */
const session = require('../controller/session');
const admin = require('../controller/admin');

const Router = require('co-router');
const router = new Router();

//VIEWS
router.get('/', session.isAdmin, admin.showDashboard);

router.get('/emails', session.isAdmin, admin.showDashboardEmails);

router.get('/payment', session.isAdmin, admin.showDashboardPayment);

router.get('/checkin', session.isAdmin, admin.showDashboardCheckin);

router.get('/invoice', session.isAdmin, admin.showDashboardInvoice);

router.get('/teamoverview', session.isAdmin, admin.showOverview);

router.post('/payment/add', session.isAdmin, admin.addPayment);

router.post('/lastcontact', session.isAdmin, admin.updateLastContact);

router.post('/invoice/amount/add', session.isAdmin, admin.addAmountToInvoice);

router.post('/invoice/add', session.isAdmin, admin.addInvoice);

router.post('/team/checkin', session.isAdmin, admin.checkinTeam);


module.exports = router;
