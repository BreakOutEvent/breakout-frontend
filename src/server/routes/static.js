'use strict';

/**
 * Routes for all static pages.
 */
const Router = require('co-router');
const router = new Router();
const session = require('../controller/SessionController');

const StaticController = require('../controller/StaticController.js');

router.get('/members', StaticController.renderMemberPage);

router.get('/press', StaticController.renderPressPage);

router.get('/', session.refreshSession, StaticController.renderLandingpage);

router.get('/partner', StaticController.renderPartnerPage);

router.get('/next-steps', StaticController.renderNextSteps);

router.get('/imprint', StaticController.renderImprint);

router.get('/statravel', StaticController.renderStatravelPage);

router.get('/code-of-honour', StaticController.renderCodeOfHonour);

router.get('/terms-and-conditions', StaticController.renderTermsAndConditions);

router.get('/sponsor-tos', StaticController.renderSponsorTermsAndConditions);

router.get('/faq', StaticController.renderFAQPage);

router.get('/privacy-policy', StaticController.renderPrivacyPolicy);

router.get('/newsletter', StaticController.render('newsletter', 'Newsletter'));

module.exports = router;
