'use strict';

/**
 * Routes for all static pages.
 */
const Router = require('co-router');
const router = new Router();

const StaticController = require('../controller/page-controller/static.js');

router.get('/members', StaticController.renderTeamPage);

router.get('/press', StaticController.renderPressPage);

router.get('/', StaticController.render('about', 'About'));

router.get('/partner', StaticController.render('partner', 'Partner'));

router.get('/next-steps', StaticController.render('nextSteps', 'Next Steps'));

router.get('/imprint', StaticController.render('imprint', 'Imprint'));

router.get('/code-of-honour', StaticController.render('codeOfHonour', 'Code of Honour'));

router.get('/terms-and-conditions', StaticController.render('termsAndConditions', 'Terms and Conditions'));

router.get('/faq', StaticController.renderFAQPage);

router.get('/get-involved', StaticController.render('getInvolved', 'Get Involved'));

router.get('/newsletter', StaticController.render('newsletter', 'Newsletter'));

module.exports = router;
