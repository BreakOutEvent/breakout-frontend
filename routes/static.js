'use strict';

/**
 * Routes for all static pages.
 */
const Router = require('co-router');
const router = new Router();

const StaticController = require('../controller/page-controller/static.js');

router.get('/members', StaticController.renderMemberPage);

router.get('/press', StaticController.renderPressPage);

router.get('/', StaticController.render('about', 'About'));

router.get('/partner', StaticController.renderPartnerPage);

router.get('/next-steps', StaticController.renderNextSteps);

router.get('/imprint', StaticController.render('imprint', 'Imprint'));

router.get('/code-of-honour', StaticController.renderCodeOfHonour);

router.get('/terms-and-conditions', StaticController.renderTermsAndConditions);

router.get('/faq', StaticController.renderFAQPage);

router.get('/get-involved', StaticController.render('getInvolved', 'Get Involved'));

router.get('/newsletter', StaticController.render('newsletter', 'Newsletter'));

module.exports = router;
