'use strict';

/**
 * Routes for the admin dashboard.
 */
const session = require('../controller/SessionController');
const event = require('../controller/EventManagementController');

const Router = require('co-router');
const router = new Router();

//VIEWS
router.get('/', session.isEventManager, event.showEventsOverview);

router.get('/overview', session.isEventManager, event.showEventsOverview);

router.get('/checkin', session.isEventManager, event.showDashboardCheckin);

router.get('/teamoverview', session.isEventManager, event.showTeamOverview);

router.get('/allchallenges', session.isEventManager, event.showAllChallenges);

router.get('/teamoverview/calls', session.isEventManager, event.showCallsForTeam);

module.exports = router;
