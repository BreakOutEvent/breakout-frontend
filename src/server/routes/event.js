'use strict';

/**
 * Routes for the admin dashboard.
 */
const session = require('../controller/SessionController');
const event = require('../controller/EventManagementController');

const Router = require('co-router');
const router = new Router();

//VIEWS
router.get('/', session.isAdmin, event.showDashboardCheckin);

router.get('/checkin', session.isAdmin, event.showDashboardCheckin);

router.get('/teamoverview', session.isAdmin, event.showOverview);

router.get('/allchallenges', session.isAdmin, event.showAllChallenges);

router.get('/teamoverview/calls', session.isAdmin, event.showCallsForTeam);

module.exports = router;
