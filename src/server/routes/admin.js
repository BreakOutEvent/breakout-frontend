'use strict';

/**
 * Routes for the admin dashboard.
 */
const session = require('../controller/SessionController');
const admin = require('../controller/AdminController');
const event = require('./event');
const finance = require('./finance');

const Router = require('co-router');
const router = new Router();

//VIEWS
router.get('/', session.isAdmin, admin.showDashboardUsers);

router.get('/emails', session.isAdmin, admin.showDashboardEmails);

router.get('/users', session.isAdmin, admin.showDashboardUsers);

router.post('/payment/add', session.isAdmin, admin.addPayment);

router.post('/sleep', session.isAdmin, admin.setTeamSleepStatus);

router.post('/lastcontact', session.isAdmin, admin.updateLastContact);

router.post('/invoice/amount/add', session.isAdmin, admin.addAmountToInvoice);
router.post('/invoice/add', session.isAdmin, admin.addInvoice);

router.post('/team/checkin', session.isAdmin, admin.checkinTeam);

router.post('/challengeProof', session.isAdmin, admin.challengeProof);

module.exports = router;
