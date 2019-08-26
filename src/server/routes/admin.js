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

router.post('/payment/add', session.isFinanceManager, admin.addPayment);

router.post('/sleep', session.isEventManager, admin.setTeamSleepStatus);

router.post('/lastcontact', session.isEventManager, admin.updateLastContact);

router.post('/invoice/amount/add', session.isFinanceManager, admin.addAmountToInvoice);

router.post('/invoice/add', session.isFinanceManager, admin.addInvoice);

router.post('/team/checkin', session.isEventManager, admin.checkinTeam);

router.post('/challengeProof', session.isEventManager, admin.challengeProof);

module.exports = router;
