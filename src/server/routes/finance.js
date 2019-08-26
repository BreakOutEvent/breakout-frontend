'use strict';

/**
 * Routes for the admin dashboard.
 */
const session = require('../controller/SessionController');
const finance = require('../controller/FinanceController');

const Router = require('co-router');
const router = new Router();

//VIEWS
router.get('/', session.isFinanceManager, finance.showDashboardPayment);

router.get('/payment', session.isFinanceManager, finance.showDashboardPayment);

router.get('/invoice', session.isFinanceManager, finance.showDashboardInvoice);

module.exports = router;
